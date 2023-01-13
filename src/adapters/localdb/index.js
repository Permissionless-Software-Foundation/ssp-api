/*
  This library encapsulates code concerned with MongoDB and Mongoose models.
*/

// Load Mongoose models.
import Users from './models/users.js'
import Store from './models/store-model.js'
import Claim from './models/claim-model.js'

class LocalDB {
  constructor () {
    // Encapsulate dependencies
    this.Users = Users
    this.Store = Store
    this.Claim = Claim
  }
}

export default LocalDB
