/*
  This library contains business-logic for dealing with users. Most of these
  functions are called by the /user REST API endpoints.
*/

// Global npm libraries
import SlpWallet from 'minimal-slp-wallet'

// Local libraries
import StoreEntity from '../entities/store-entity.js'
import wlogger from '../adapters/wlogger.js'
import config from '../../config/index.js'

class StoreUseCase {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Store Use Cases library.'
      )
    }

    // Encapsulate dependencies
    this.storeEntity = new StoreEntity()
    this.StoreModel = this.adapters.localdb.Store
    this.wallet = new SlpWallet(undefined, { interface: 'consumer-api' })
    this.config = config

    // Bind 'this' objec to all subfunctions
    this.createStore = this.createStore.bind(this)
    this.updateMutableData = this.updateMutableData.bind(this)
    this.getAllSafeStores = this.getAllSafeStores.bind(this)
    this.filterStoresByBox = this.filterStoresByBox.bind(this)
  }

  // Create a new store model and add it to the Mongo database.
  // This endpoint is called by a REST API webhook originating from
  // an instance of psf-slp-indexer running the ssp branch.
  async createStore (storeObj) {
    try {
      // console.log('storeObj: ', storeObj)

      // Input Validation
      this.storeEntity.validate(storeObj)

      const storeModel = new this.StoreModel(storeObj)
      // console.log('store model: ', storeModel)

      // Set the update time.
      const now = new Date()
      storeModel.lastUpdated = now.toISOString()

      try {
        await storeModel.save()
      } catch (err) {
        throw new Error('Token has already been recorded into database.')
      }

      return storeModel.toJSON()
    } catch (err) {
      // console.log('createUser() error: ', err)
      // wlogger.error('Error in use-cases/stores.js/createStore(): ', err.message)
      wlogger.error(`Error in use-cases/stores.js/createStore(): ${err.message}`)
      throw err
    }
  }

  // Retrieve a database model for a store, based on its token ID. Then download
  // the latest mutable data for the token and save it to the database model.
  async updateMutableData (tokenId, updateCache = false) {
    try {
      if (!tokenId) throw new Error('Token ID required to update mutable data for a store.')

      // Retrieve the model of the store from the Mongo database.
      const storeModel = await this.StoreModel.findOne({ tokenId })
      if (!storeModel) {
        throw new Error(`updateMutableData(): Store not found in database with token ID ${tokenId}`)
      }

      // Get the mutable data for the token and update the cache on the server.
      const tokenData = await this.wallet.getTokenData2(tokenId, updateCache)
      // console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)

      // Abort if the mutable data could not be downloaded.
      if (!tokenData.mutableData || !tokenData.mutableData.jsonLd || !tokenData.mutableData.jsonLd.storeData) {
        throw new Error(`Could not retrieve mutable store data for token ${tokenId}`)
      }

      // Update the token data.
      storeModel.immutableData = tokenData.immutableData
      storeModel.mutableData = tokenData.mutableData
      storeModel.storeData = tokenData.mutableData.jsonLd.storeData

      // Signal that the store was updated.
      const now = new Date()
      storeModel.lastUpdated = now.toISOString()

      await storeModel.save()

      return storeModel.toJSON()
    } catch (err) {
      // console.log('updateMutableData() error: ', err)
      wlogger.error(`Error in use-cases/stores.js/updateMutableData(): ${err.message}`)
      throw err
    }
  }

  // This function will probably be deprecated in the future, as it won't scale.
  // This function retrieves all Stores in the database. It then looks at each
  // Claim and removes the stores if the NSFW or Garbage claims meet a threshold.
  // The function returns an array of leftover stores.
  async getAllSafeStores () {
    try {
      // All stores in the database
      const stores = await this.adapters.localdb.Store.find({})

      // Stores filtered against NSFW and Garbage claims
      const filteredStores = []

      // Loop through each store
      for (let i = 0; i < stores.length; i++) {
        const thisStore = stores[i]

        // Skip the token if it fails the filters.
        const ignoreStore = await this.tokenShouldBeIgnored({ thisStore })
        if (ignoreStore) continue

        filteredStores.push(thisStore)
      }

      return filteredStores
    } catch (err) {
      console.error('Error in getAllStores(): ', err.message)
      throw err
    }
  }

  // Analyze token data to see if Store should be ignored. Expects token database
  // model as input, returns a Boolean. True = token should be ignored
  async tokenShouldBeIgnored (inObj = {}) {
    try {
      const NSFW_THRESHOLD = this.config.nsfwThreshold
      const GARBAGE_THRESHOLD = this.config.garbageThreshold

      const { thisStore } = inObj

      // Check the flags on the model for fast processing.
      if (thisStore.flaggedAsGarbage) return true
      if (thisStore.flaggedAsNSFW) return true

      const claims = thisStore.claims
      // console.log(`Claims for store ${thisStore.name}: ${JSON.stringify(claims, null, 2)}`)

      let nsfwClaims = 0
      let garbageClaims = 0

      // Loop through each claim.
      for (let j = 0; j < claims.length; j++) {
        const thisClaimId = claims[j]
        const thisClaim = await this.adapters.localdb.Claim.findById(thisClaimId)
        // console.log('thisClaim: ', thisClaim)

        if (thisClaim.type === 103) {
          nsfwClaims++

          // If this is marked as NSFW by the admin address, then automatically
          // flag the store to be ignored.
          if (thisClaim.address === this.config.adminAddr) {
            thisStore.flaggedAsNSFW = true
            await thisStore.save()

            return true
          }
        }
        if (thisClaim.type === 104) {
          garbageClaims++

          // If this is marked as Garbage by the admin address, then
          // automatically flag the store to be ignored.
          if (thisClaim.address === this.config.adminAddr) {
            thisStore.flaggedAsGarbage = true
            await thisStore.save()

            return true
          }
        }
      }

      console.log(`NSFW claims against ${thisStore.name}: ${nsfwClaims}`)

      // Skip this store if the Claims are above the threshold.
      if (nsfwClaims >= NSFW_THRESHOLD) {
        thisStore.flaggedAsNSFW = true
        await thisStore.save()

        return true
      }
      if (garbageClaims >= GARBAGE_THRESHOLD) {
        thisStore.flaggedAsGarbage = true
        await thisStore.save()

        return true
      }

      // Return false if none of the above filters caught the entry.
      return false
    } catch (err) {
      console.error('Error in tokenShouldBeIgnored()')
      throw err
    }
  }

  // This function expects an array of stores and a map boundry.
  // The map boundry is defined by two sets of lat/long coordinates. One set
  // defines the NE corner of the map, the other defines the SW corner.
  // This function will return an array of stores, filtered by the map boundry.
  // The returned stores will be within the box defined by the map boundry.
  // This function is used to detect which stores are currently displayed on
  // the map, so that details about those stores can be displayed on the
  // right side of the UI.
  async filterStoresByBox (inObj = {}) {
    try {
      const { box = {} } = inObj
      // console.log('box: ', box)

      const boxSw = box._southWest
      const boxNe = box._northEast

      // Get all the stores in the database.
      const stores = await this.adapters.localdb.Store.find({})
      // console.log('stores[0]: ', JSON.stringify(stores[0], null, 2))

      const filteredStores = []

      // Filter them by the map boundry.
      for (let i = 0; i < stores.length; i++) {
        const thisStore = stores[i]

        // Skip the store if it should be ignored
        const ignoreStore = await this.tokenShouldBeIgnored({ thisStore })
        if (ignoreStore) continue

        // Check that latitude and longitude of the store.
        try {
          const storeCoords = thisStore.storeData.location.geo
          // console.log('storeCoords: ', storeCoords)

          const StoreLat = parseFloat(storeCoords.latitude)
          const StoreLng = parseFloat(storeCoords.longitude)

          // Logical tests
          const storeLatIsGood = StoreLat >= boxSw.lat && StoreLat <= boxNe.lat
          const storeLngIsGood = StoreLng >= boxSw.lng && StoreLng <= boxNe.lng

          // Add the store to the filtered list if their coordinates land within the box.
          if (storeLatIsGood && storeLngIsGood) filteredStores.push(thisStore)
        } catch (err) {
          continue
        }
      }

      // Sort the resulting stores by their lastUpdated timestamp.
      // This will result in a DESCENDING list of stores, with the most recently
      // updated stores at the top of the list.
      filteredStores.sort((a, b) => {
        let aTime = a.lastUpdated
        let bTime = b.lastUpdated

        if (!aTime) {
          aTime = 946713600000
        } else {
          aTime = new Date(aTime).getTime()
        }

        if (!bTime) {
          bTime = 946713600000
        } else {
          bTime = new Date(bTime).getTime()
        }

        return bTime - aTime
      })

      return filteredStores
    } catch (err) {
      console.error('Error in MapUtil.filterStoresByBox: ', err)
    }
  }
}

export default StoreUseCase
