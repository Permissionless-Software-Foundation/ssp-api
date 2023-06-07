/*
  Mongoose database model for a store.
*/

// Global npm libraries
import mongoose from 'mongoose'
// import bcrypt from 'bcryptjs'
// import jwt from 'jsonwebtoken'

// Local libraries
// import config from '../../../../config/index.js'

const Store = new mongoose.Schema({
  type: { type: Number, default: 129 },
  ticker: { type: String },
  name: { type: String },
  tokenId: { type: String, required: true, unique: true },
  documentUri: { type: String },
  documentHash: { type: String },
  decimals: { type: Number },
  mintBatonIsActive: { type: Boolean },
  tokensInCirculationBN: { type: String },
  tokensInCirculationStr: { type: String },
  blockCreated: { type: Number },
  totalBurned: { type: String },
  totalMinted: { type: String },
  nfts: { type: Array },
  isSsp: { type: Boolean },
  immutableData: { type: Object },
  mutableData: { type: Object },
  storeData: { type: Object },
  claims: { type: Array },
  flaggedAsGarbage: { type: Boolean },
  flaggedAsNSFW: { type: Boolean }
})

// export default mongoose.model('user', User)
export default mongoose.model('store', Store)
