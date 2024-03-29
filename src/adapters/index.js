/*
  This is a top-level library that encapsulates all the additional Adapters.
  The concept of Adapters comes from Clean Architecture:
  https://troutsblog.com/blog/clean-architecture
*/

// Public NPM libraries
import BCHJS from '@psf/bch-js'

// Load individual adapter libraries.
import IPFSAdapter from './ipfs/index.js'

import LocalDB from './localdb/index.js'
import LogsAPI from './logapi.js'
import Passport from './passport.js'
import Nodemailer from './nodemailer.js'

// const { wlogger } = require('./wlogger')
import JSONFiles from './json-files.js'

import FullStackJWT from './fullstack-jwt.js'
import config from '../../config/index.js'

class Adapters {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.ipfs = new IPFSAdapter()
    this.localdb = new LocalDB()
    this.logapi = new LogsAPI()
    this.passport = new Passport()
    this.nodemailer = new Nodemailer()
    this.jsonFiles = new JSONFiles()
    this.bchjs = new BCHJS()
    this.config = config

    // Get a valid JWT API key and instance bch-js.
    this.fullStackJwt = new FullStackJWT(config)
  }

  async start () {
    return true

    //   // Start the IPFS node.
    //   // Do not start these adapters if this is an e2e test.
    //   if (this.config.env !== 'test') {
    //     if (this.config.useIpfs) {
    //       await this.ipfs.start()
    //     }
    //   } else {
    //     // These lines are here to ensure code coverage hits 100%.
    //     console.log('Not starting IPFS node since this is an e2e test.')
    //   }
    //
    //   console.log('Async Adapters have been started.')
    //
    //   return true
    // } catch (err) {
    //   console.error('Error in adapters/index.js/start()')
    //   throw err
    // }
  }
}

export default Adapters
