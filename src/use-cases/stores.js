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
  // the latest mutable data for the token and update the database model.
  async updateMutableData (tokenId) {
    try {
      // Retrieve the model of the store from the Mongo database.
      const storeModel = await this.StoreModel.findOne({ tokenId })
      if (!storeModel) {
        throw new Error(`updateMutableData(): Store not found in database with token ID ${tokenId}`)
      }

      // Get the mutable data for the token.
      const tokenData = await this.wallet.getTokenData2(tokenId)
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
}

export default StoreUseCase
