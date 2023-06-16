/*
  This faucet is an optional feature. If enabled in the config file, it will
  read in a faucet-wallet.json file. When a user calls the POST /store/faucet
  endpoint, it will fund their address with an amount of BCH.

  If the faucet option is disabled, or the wallet is empty, the endpoint will
  throw an error.
*/

// Global npm libraries
import SlpWallet from 'minimal-slp-wallet'

// Local libraries
import config from '../../config/index.js'

// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const WALLET_FILE = `${__dirname.toString()}/../../faucet-wallet.json`

class FaucetUseCase {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Store Use Cases library.'
      )
    }

    // Encapsulate dependencies
    this.config = config
    this.SlpWallet = SlpWallet
  }

  // Open the faucet wallet and instantiate the wallet object.
  async openFaucetWallet () {
    try {
      let walletData

      // Try to open the wallet.json file.
      try {
        // console.log('this.WALLET_FILE: ', this.WALLET_FILE)
        walletData = await this.adapters.jsonFiles.readJSON(WALLET_FILE)
      } catch (err) {
        // Create a new wallet file if one does not already exist.
        // console.log('Wallet file not found. Creating new wallet.json file.')
        // Create a new wallet.
        // No-Update flag creates wallet without making any network calls.
        const walletInstance = new this.SlpWallet(undefined, { noUpdate: true })
        // Wait for wallet to initialize.
        await walletInstance.walletInfoPromise
        walletData = walletInstance.walletInfo
        // Add the nextAddress property
        walletData.nextAddress = 1
        // Write the wallet data to the JSON file.
        await this.adapters.jsonFiles.writeJSON(walletData, WALLET_FILE)
      }
      // console.log('walletData: ', walletData)
      return walletData
    } catch (err) {
      console.error('Error in openFaucetWallet()')
      throw err
    }
  }

  // Create an instance of minimal-slp-wallet. Use data in the wallet.json file,
  // and pass the bch-js information to the minimal-slp-wallet library.
  async instanceWallet (walletData) {
    try {
      // console.log(`instanceWallet() walletData: ${JSON.stringify(walletData, null, 2)}`)
      // TODO: throw error if wallet data is not passed in.
      if (!walletData.mnemonic) {
        throw new Error('Wallet data is not formatted correctly. Can not read mnemonic in wallet file!')
      }

      const advancedConfig = {}
      console.log(`Using web 2 Cash Stack: ${this.config.useWeb2}`)
      if (this.config.useWeb2) {
        advancedConfig.interface = 'rest-api'
        advancedConfig.restURL = this.config.apiServer
        advancedConfig.apiToken = this.config.apiToken
        advancedConfig.authPass = this.config.authPass
      } else {
        advancedConfig.interface = 'consumer-api'
        advancedConfig.restURL = this.config.consumerUrl
      }

      // Instantiate minimal-slp-wallet.
      // this.bchWallet = new this.BchWallet(walletData.mnemonic, advancedConfig)
      this.bchWallet = await this._instanceWallet(walletData.mnemonic, advancedConfig)

      // console.log(`this.bchWallet.walletInfo: ${JSON.stringify(this.bchWallet.walletInfo, null, 2)}`)
      // Initialize the wallet
      await this.bchWallet.initialize()
      console.log(`Faucet wallet initialized. Wallet address: ${this.bchWallet.walletInfo.cashAddress}`)

      return this.bchWallet
    } catch (err) {
      console.error('Error in instanceWallet()')
      throw err
    }
  }

  // This function is used for easier mocking of unit tests.
  async _instanceWallet (mnemonic, config) {
    const wallet = new this.SlpWallet(mnemonic, config)
    await wallet.walletInfoPromise
    return wallet
  }

  // Fund and address with BCH.
  async fundAddr (inObj = {}) {
    try {
      const { bchAddress } = inObj
      console.log(`Attempting to fund address ${bchAddress} from the faucet`)

      await this.bchWallet.initialize()

      const receivers = [{
        address: bchAddress,
        amountSat: this.config.faucetSats
      }]

      const txid = await this.bchWallet.send(receivers)

      await this.bchWallet.bchjs.Util.sleep(2000)

      return txid
    } catch (err) {
      console.error('Error in fundAddr()')
      throw err
    }
  }
}

export default FaucetUseCase
