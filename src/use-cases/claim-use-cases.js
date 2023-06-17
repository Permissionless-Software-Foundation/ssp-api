/*
  This library contains business-logic for dealing with claims. This library
  is called by the following REST API endpoints:
  - POST /webhook/claim
*/

// Global npm libraries
import axios from 'axios'
import SlpWallet from 'minimal-slp-wallet'

// Local libraries
import ClaimEntity from '../entities/claim-entity.js'
import wlogger from '../adapters/wlogger.js'
import config from '../../config/index.js'

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
    this.config = config
    this.axios = axios
    this.wallet = new SlpWallet(undefined, { interface: 'consumer-api' })

    // Bind 'this' object to all subfunctions
    this.createClaim = this.createClaim.bind(this)
    this.getClaimContent = this.getClaimContent.bind(this)
  }

  // Create a new claim model and add it to the Mongo database.
  // This endpoint is called by a REST API webhook originating from
  // an instance of psf-slp-indexer running the ssp branch.
  async createClaim (claimObj) {
    try {
      console.log('claimObj: ', claimObj)

      // Input Validation
      this.claimEntity.validate(claimObj)

      // Assign a value of 100 if the claim has not type.
      // Type 100 is recorded but otherwise ignored.
      if (!claimObj.type) claimObj.type = 100

      // Get the input address of the TXID so that we can assign the claim as
      // coming from a specific address.
      const txDetails = await this.wallet.getTxData([claimObj.txid])
      // console.log(`txDetails: ${JSON.stringify(txDetails, null, 2)}`)
      const address = txDetails[0].vin[0].address
      claimObj.address = address

      const claimModel = new this.ClaimModel(claimObj)
      // console.log('store model: ', storeModel)

      try {
        await claimModel.save()
      } catch (err) {
        throw new Error('Claim has already been recorded into database.')
      }

      // Download the content from an IPFS gateway, but don't let it block
      // execution, and ignore any errors.
      if (claimObj.type === 102) {
        try {
          this.getClaimContent(claimModel, claimModel.content)
        } catch (err) {
          console.log('Error trying to download claim content from IPFS gateway: ', err)
        }
      }

      // Add the claim to the store model, but don't let it block execution
      // and ignore any errors.
      try {
        this.addClaimToStore(claimModel)
      } catch (err) {
        console.log(`Error trying to add claim ${claimObj.txid} to token model ${claimObj.about}: `, err)
      }

      return claimModel.toJSON()
    } catch (err) {
      // console.log('createUser() error: ', err)
      // wlogger.error('Error in use-cases/stores.js/createStore(): ', err.message)
      wlogger.error(`Error in use-cases/claims.js/createClaim(): ${err.message}`)
      throw err
    }
  }

  // Retrieve the content of a claim from an IPFS gateway, and save it to the
  // database model for the claim.
  async getClaimContent (claimModel, cid) {
    try {
      const url = `${this.config.ipfsGateway}/ipfs/${cid}/data.json`

      const result = await this.axios.get(url)
      console.log('claim data: ', result.data)
      console.log('typeof data: ', typeof (result.data))

      claimModel.downloadedContent = result.data

      await claimModel.save()

      return true
    } catch (err) {
      console.error('Error in getClaimContent(): ', err.message)
      throw err
    }
  }

  // Add a claim to the Store database model
  async addClaimToStore (claimModel) {
    try {
      console.log('claimModel: ', claimModel)

      // Get the store associated with the claim.about field.
      const tokenId = claimModel.about
      const Store = this.adapters.localdb.Store
      const thisStore = await Store.findOne({ tokenId })
      console.log('thisStore: ', thisStore)

      if(!thisStore) {
        throw new Error(`Store with tokenId ${tokenId} not found.`)
      }

      thisStore.claims.push(claimModel._id)

      await thisStore.save()

      return true
    } catch (err) {
      console.error('Error in addClaimToStore(): ', err.message)
      throw err
    }
  }
}

export default ClaimUseCase
