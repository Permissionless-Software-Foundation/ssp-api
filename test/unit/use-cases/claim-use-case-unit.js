/*
  Unit tests for the claim Use Case library
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../mocks/adapters/index.js'

// Unit under test (uut)
import ClaimUseCases from '../../../src/use-cases/claim-use-cases.js'

describe('#claim-use-case', () => {
  let uut
  let sandbox
  // const testUser = {}

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new ClaimUseCases({ adapters })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new ClaimUseCases()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Claim Use Cases library.'
        )
      }
    })
  })

  describe('#createClaim', () => {
    it('should create a new claim database entry', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.claimEntity, 'validate').returns(true)
      sandbox.stub(uut.wallet,'getTxData').resolves([{
        vin: [{
          address: 'fake-addr'
        }]
      }])

      const mockObj = {
        txid: 'test'
      }

      const result = await uut.createClaim(mockObj)
      // console.log('result: ', result)

      assert.isObject(result)
    })

    it('should throw error if store is already in database', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.claimEntity, 'validate').returns(true)
        sandbox.stub(uut.wallet,'getTxData').resolves([{
          vin: [{
            address: 'fake-addr'
          }]
        }])
        const ClaimModel = class Claim {
          async save () {
            throw new Error('test error')
          }
        }
        uut.ClaimModel = ClaimModel

        await uut.createClaim({})

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Claim has already been recorded into database.')
      }
    })
  })
})
