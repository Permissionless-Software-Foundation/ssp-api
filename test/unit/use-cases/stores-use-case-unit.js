/*
  Unit tests for the stores Use Case library
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
// const testUtils = require('../../utils/test-utils')

// Unit under test (uut)
import StoreUseCases from '../../../src/use-cases/stores.js'
import adapters from '../mocks/adapters/index.js'

describe('#users-use-case', () => {
  let uut
  let sandbox
  // const testUser = {}

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new StoreUseCases({ adapters })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new StoreUseCases()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Store Use Cases library.'
        )
      }
    })
  })

  describe('#createStore', () => {
    it('should create a new store database entry', async () => {
      const mockObj = {
        tokenId: 'test'
      }

      // Mock dependencies and force desired code path
      sandbox.stub(uut.storeEntity, 'validate').returns(true)

      const result = await uut.createStore(mockObj)
      // console.log('result: ', result)

      assert.isObject(result)
    })

    it('should throw error if store is already in database', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.storeEntity, 'validate').returns(true)
        const StoreModel = class Store {
          async save () {
            throw new Error('test error')
          }
        }
        uut.StoreModel = StoreModel

        await uut.createStore({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Token has already been recorded into database.')
      }
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut.storeEntity, 'validate').throws(new Error('test error'))

        await uut.createStore()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#updateMutableData', () => {
    it('should update the mutable data for a token', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.StoreModel, 'findOne').resolves(new uut.StoreModel())
      sandbox.stub(uut.wallet, 'getTokenData2').resolves({
        mutableData: {
          jsonLd: {
            storeData: {}
          }
        }
      })

      const result = await uut.updateMutableData('test')
      // console.log('result: ', result)

      assert.isObject(result)
    })

    it('should throw an error if the store is not found in the Mongo DB', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.StoreModel, 'findOne').resolves()

        await uut.updateMutableData('test')

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Store not found in database with token ID')
      }
    })

    it('should throw an error if network error happens during retrieval of mutable data', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.StoreModel, 'findOne').resolves(new uut.StoreModel())
        sandbox.stub(uut.wallet, 'getTokenData2').rejects(new Error('network error'))

        await uut.updateMutableData('test')

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'network error')
      }
    })

    it('should throw an error if mutable data can not be retrieved', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.StoreModel, 'findOne').resolves(new uut.StoreModel())
        sandbox.stub(uut.wallet, 'getTokenData2').resolves({})

        await uut.updateMutableData('test')

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Could not retrieve mutable store data for token')
      }
    })
  })

  describe('#tokenShouldBeIgnored', () => {
    it('should return true if token was previously flagged as garbage', async () => {
      const thisStore = {
        flaggedAsGarbage: true
      }

      const result = await uut.tokenShouldBeIgnored({ thisStore })

      assert.equal(result, true)
    })

    it('should return true if token was previously flagged as NSFW', async () => {
      const thisStore = {
        flaggedAsNSFW: true
      }

      const result = await uut.tokenShouldBeIgnored({ thisStore })

      assert.equal(result, true)
    })

    it('should return false if token has no claims', async () => {
      const thisStore = {
        flaggedAsGarbage: false,
        flaggedAsNSFW: false,
        claims: []
      }

      const result = await uut.tokenShouldBeIgnored({ thisStore })

      assert.equal(result, false)
    })
  })
})
