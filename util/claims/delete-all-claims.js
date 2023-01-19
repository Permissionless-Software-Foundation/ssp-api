import mongoose from 'mongoose'

// Force test environment
// make sure environment variable is set before this file gets called.
// see test script in package.json.
// process.env.KOA_ENV = 'test'
import config from '../../config/index.js'

import Claim from '../../src/adapters/localdb/models/claim-model.js'

async function deleteClaims () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(config.database, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })

  // Get all the users in the DB.
  const claims = await Claim.find({})
  // console.log(`users: ${JSON.stringify(users, null, 2)}`)

  // Delete each user.
  for (let i = 0; i < claims.length; i++) {
    const thisClaim = claims[i]
    await thisClaim.remove()
  }

  mongoose.connection.close()
}

deleteClaims()
