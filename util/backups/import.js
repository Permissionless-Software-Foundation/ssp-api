/*
  Restore an ssp-api database from the JSON backup file generated by export.js
*/

// Global npm libraries
import mongoose from 'mongoose'

// Local libraries
import config from '../../config/index.js'
import Store from '../../src/adapters/localdb/models/store-model.js'
import Claim from '../../src/adapters/localdb/models/claim-model.js'
import JsonFiles from '../../src/adapters/json-files.js'

async function importBackup() {
  try {
    // Connect to the Mongo Database.
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.
    await mongoose.connect(
      config.database,
      { useNewUrlParser: true, useUnifiedTopology: true }
    )

    // Read in the JSON file
    const jsonFiles = new JsonFiles()
    const backupData = await jsonFiles.readJSON('./ssp-api-backup.json')
    console.log('backupData: ', backupData)

    const stores = backupData.stores
    const claims = backupData.claims

    // Loop through each store and insert it into the database.
    for(let i=0; i < stores.length; i++) {
      const thisStore = stores[i]

      const storeModel = new Store(thisStore)
      await storeModel.save()
    }

    // Loop through each claim and insert it into the database.
    for(let i=0; i < claims.length; i++) {
      const thisClaim = claims[i]

      const claimModel = new Claim(thisClaim)
      await claimModel.save()
    }

    // Close the database connection
    mongoose.connection.close()

    console.log('Database restored!')
  } catch(err) {
    console.error('Error while trying to create backup: ', err)
  }
}
importBackup()
