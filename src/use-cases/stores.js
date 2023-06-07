/*
  This library contains business-logic for dealing with users. Most of these
  functions are called by the /user REST API endpoints.
*/

// Global npm libraries
import SlpWallet from 'minimal-slp-wallet'

// Local libraries
import StoreEntity from '../entities/store-entity.js'
import wlogger from '../adapters/wlogger.js'

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
    // this.UserEntity = new UserEntity()
    // this.UserModel = this.adapters.localdb.Users
    this.storeEntity = new StoreEntity()
    this.StoreModel = this.adapters.localdb.Store
    this.wallet = new SlpWallet(undefined, { interface: 'consumer-api' })
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
      const NSFW_THRESHOLD = 4
      const GARBAGE_THRESHOLD = 4

      // All stores in the database
      const stores = await this.adapters.localdb.Store.find({})

      // Stores filtered against NSFW and Garbage claims
      const filteredStores = []

      // Loop through each store
      for (let i = 0; i < stores.length; i++) {
        const thisStore = stores[i]

        const claims = thisStore.claims
        // console.log(`Claims for store ${thisStore.name}: ${JSON.stringify(claims, null, 2)}`)

        let nsfwClaims = 0
        let garbageClaims = 0

        // Loop through each claim.
        for (let j = 0; j < claims.length; j++) {
          const thisClaimId = claims[j]
          const thisClaim = await this.adapters.localdb.Claim.findById(thisClaimId)
          // console.log('thisClaim: ', thisClaim)

          if (thisClaim.type === 103) nsfwClaims++
          if (thisClaim.type === 104) garbageClaims++
        }

        console.log(`NSFW claims against ${thisStore.name}: ${nsfwClaims}`)

        // Skip this store if the Claims are above the threshold.
        if (nsfwClaims >= NSFW_THRESHOLD) continue
        if (garbageClaims >= GARBAGE_THRESHOLD) continue

        filteredStores.push(thisStore)
      }

      return filteredStores
    } catch (err) {
      console.error('Error in getAllStores(): ', err.message)
      throw err
    }
  }
}

export default StoreUseCase
