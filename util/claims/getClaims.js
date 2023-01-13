import mongoose from 'mongoose'
import config from '../../config/index.js'
import Claim from '../../src/adapters/localdb/models/claim-model.js'

async function getClaims () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )

  const claims = await Claim.find({})
  console.log(`claims: ${JSON.stringify(claims, null, 2)}`)

  mongoose.connection.close()
}
getClaims()
