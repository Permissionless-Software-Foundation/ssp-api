/*
  Mongoose database model for a claim.
*/

// Global npm libraries
import mongoose from 'mongoose'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

// Local libraries
// import config from '../../../../config/index.js'

const Claim = new mongoose.Schema({
  txid: { type: String, required: true, unique: true },
  type: { type: Number },
  about: { type: String },
  content: { type: String },
  downloadedContent: { type: Object },
  address: { type: String } // Address that generated the claim (vin[0])
})

// export default mongoose.model('user', User)
export default mongoose.model('claim', Claim)
