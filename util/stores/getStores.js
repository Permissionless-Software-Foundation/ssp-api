import mongoose from 'mongoose'
import config from '../../config/index.js'
import Store from '../../src/adapters/localdb/models/store-model.js'

async function getStores () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )

  const stores = await Store.find({})
  console.log(`stores: ${JSON.stringify(stores, null, 2)}`)

  mongoose.connection.close()
}
getStores()
