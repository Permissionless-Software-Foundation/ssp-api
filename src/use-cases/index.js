/*
  This is a top-level library that encapsulates all the additional Use Cases.
  The concept of Use Cases comes from Clean Architecture:
  https://troutsblog.com/blog/clean-architecture
*/

// Local libraries
import UserUseCases from './user.js'
import StoreUseCases from './stores.js'
import ClaimUseCases from './claim-use-cases.js'
import config from '../../config/index.js'

class UseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Use Cases library.'
      )
    }

    // console.log('use-cases/index.js localConfig: ', localConfig)
    this.user = new UserUseCases(localConfig)
    this.store = new StoreUseCases(localConfig)
    this.claim = new ClaimUseCases(localConfig)
    this.config = config
  }

  // Run any startup Use Cases at the start of the app.
  async start () {
    // try {
    console.log('Async Use Cases have been started.')

    if (this.config.useFaucet) {
      const faucetWalletInfo = await this.store.faucet.openFaucetWallet()
      await this.store.faucet.instanceWallet(faucetWalletInfo.wallet)
    }

    return true
    // } catch (err) {
    //   console.error('Error in use-cases/index.js/start()')
    //   // console.log(err)
    //   throw err
    // }
  }
}

export default UseCases
