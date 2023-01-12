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
      wlogger.error('Error in use-cases/stores.js/createStore(): ', err.message)
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
        throw new Error(`updateMutableData(): Store not found with token ID ${tokenId}`)
      }

      // Get the mutable data for the token.
      const tokenData = await this.wallet.getTokenData2(tokenId)
      console.log(`tokenData: ${JSON.stringify(tokenData, null, 2)}`)

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
      wlogger.error('Error in use-cases/stores.js/updateMutableData(): ', err.message)
      throw err
    }
  }

  // Returns an array of all user models in the Mongo database.
  // async getAllUsers () {
  //   try {
  //     // Get all user models. Delete the password property from each model.
  //     const users = await this.UserModel.find({}, '-password')
  //
  //     return users
  //   } catch (err) {
  //     wlogger.error('Error in lib/users.js/getAllUsers()')
  //     throw err
  //   }
  // }

  // Get the model for a specific user.
  // async getUser (params) {
  //   try {
  //     const { id } = params
  //
  //     const user = await this.UserModel.findById(id, '-password')
  //
  //     // Throw a 404 error if the user isn't found.
  //     if (!user) {
  //       const err = new Error('User not found')
  //       err.status = 404
  //       throw err
  //     }
  //
  //     return user
  //   } catch (err) {
  //     // console.log('Error in getUser: ', err)
  //
  //     if (err.status === 404) throw err
  //
  //     // Return 422 for any other error
  //     err.status = 422
  //     err.message = 'Unprocessable Entity'
  //     throw err
  //   }
  // }

  // async updateUser (existingUser, newData) {
  //   try {
  //     // console.log('existingUser: ', existingUser)
  //     // console.log('newData: ', newData)
  //
  //     // Input Validation
  //     // Optional inputs, but they must be strings if included.
  //     if (newData.email && typeof newData.email !== 'string') {
  //       throw new Error("Property 'email' must be a string!")
  //     }
  //     if (newData.name && typeof newData.name !== 'string') {
  //       throw new Error("Property 'name' must be a string!")
  //     }
  //     if (newData.password && typeof newData.password !== 'string') {
  //       throw new Error("Property 'password' must be a string!")
  //     }
  //
  //     // Save a copy of the original user type.
  //     const userType = existingUser.type
  //     // console.log('userType: ', userType)
  //
  //     // If user 'type' property is sent by the client
  //     if (newData.type) {
  //       if (typeof newData.type !== 'string') {
  //         throw new Error("Property 'type' must be a string!")
  //       }
  //
  //       // Unless the calling user is an admin, they can not change the user type.
  //       if (userType !== 'admin') {
  //         throw new Error("Property 'type' can only be changed by Admin user")
  //       }
  //     }
  //
  //     // Overwrite any existing data with the new data.
  //     Object.assign(existingUser, newData)
  //
  //     // Save the changes to the database.
  //     await existingUser.save()
  //
  //     // Delete the password property.
  //     delete existingUser.password
  //
  //     return existingUser
  //   } catch (err) {
  //     wlogger.error('Error in lib/users.js/updateUser()')
  //     throw err
  //   }
  // }

  // async deleteUser (user) {
  //   try {
  //     await user.remove()
  //   } catch (err) {
  //     wlogger.error('Error in lib/users.js/deleteUser()')
  //     throw err
  //   }
  // }

  // Used to authenticate a user. If the login and password salt match a user in
  // the database, then it returns the user model. The Koa REST API uses the
  // Passport library for this functionality. This function is used to
  // authenticate users who login via the JSON RPC.
  // async authUser (login, passwd) {
  //   try {
  //     // console.log('login: ', login)
  //     // console.log('passwd: ', passwd)
  //
  //     const user = await this.UserModel.findOne({ email: login })
  //     if (!user) {
  //       throw new Error('User not found')
  //     }
  //
  //     const isMatch = await user.validatePassword(passwd)
  //
  //     if (!isMatch) {
  //       throw new Error('Login credential do not match')
  //     }
  //
  //     return user
  //   } catch (err) {
  //     // console.error('Error in users.js/authUser()')
  //     console.log('')
  //     throw err
  //   }
  // }
}

export default StoreUseCase
