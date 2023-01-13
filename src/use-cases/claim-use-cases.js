/*
  This library contains business-logic for dealing with claims. This library
  is called by the following REST API endpoints:
  - POST /webhook/claim
*/

// Global npm libraries
// import SlpWallet from 'minimal-slp-wallet'

// Local libraries
import ClaimEntity from '../entities/claim-entity.js'
import wlogger from '../adapters/wlogger.js'

class ClaimUseCase {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Claim Use Cases library.'
      )
    }

    // Encapsulate dependencies
    // this.UserEntity = new UserEntity()
    // this.UserModel = this.adapters.localdb.Users
    this.claimEntity = new ClaimEntity()
    this.ClaimModel = this.adapters.localdb.Claim
    // this.wallet = new SlpWallet(undefined, { interface: 'consumer-api' })
  }

  // Create a new claim model and add it to the Mongo database.
  // This endpoint is called by a REST API webhook originating from
  // an instance of psf-slp-indexer running the ssp branch.
  async createClaim (claimObj) {
    try {
      console.log('claimObj: ', claimObj)

      // Input Validation
      this.claimEntity.validate(claimObj)

      const claimModel = new this.ClaimModel(claimObj)
      // console.log('store model: ', storeModel)

      try {
        await claimModel.save()
      } catch (err) {
        throw new Error('Claim has already been recorded into database.')
      }

      return claimModel.toJSON()
    } catch (err) {
      // console.log('createUser() error: ', err)
      // wlogger.error('Error in use-cases/stores.js/createStore(): ', err.message)
      wlogger.error(`Error in use-cases/claims.js/createClaim(): ${err.message}`)
      throw err
    }
  }

}

export default ClaimUseCase
