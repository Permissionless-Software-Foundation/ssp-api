/*
  Export all stores and claims into a JSON file.
*/

// Global npm libraries
import mongoose from 'mongoose'

// Local libraries
import config from '../../config/index.js'
import Store from '../../src/adapters/localdb/models/store-model.js'
import Claim from '../../src/adapters/localdb/models/claim-model.js'
import JsonFiles from '../../src/adapters/json-files.js'

async function exportBackup() {
  try {
    // Connect to the Mongo Database.
    mongoose.Promise = global.Promise
    mongoose.set('useCreateIndex', true) // Stop deprecation warning.
    await mongoose.connect(
      config.database,
      { useNewUrlParser: true, useUnifiedTopology: true }
    )

    const jsonFiles = new JsonFiles()

    // Get all stores
    const stores = await Store.find({})
    console.log(`stores: ${JSON.stringify(stores, null, 2)}`)

    // Get all claims
    const claims = await Claim.find({})
    console.log(`claims: ${JSON.stringify(claims, null, 2)}`)

    // Combine stores and claims into a single object
    const backup = {stores, claims}

    // Export the data to a JSON file.
    await jsonFiles.writeJSON(backup, './ssp-api-backup.json')

    console.log('Backup created: ssp-api-backup.json')

    // Close the database connection
    mongoose.connection.close()
  } catch(err) {
    console.error('Error while trying to create backup: ', err)
  }
}
exportBackup()
