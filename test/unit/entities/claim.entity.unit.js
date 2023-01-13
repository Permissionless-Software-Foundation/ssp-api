/*
  Unit tests for the Claim entity library.
*/

// Global npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import ClaimEntity from '../../../src/entities/claim-entity.js'

let sandbox
let uut

describe('#Claim-Entity', () => {
  before(async () => {})

  beforeEach(() => {
    uut = new ClaimEntity()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#validate', () => {
    it('should throw an error if txid is not provided', () => {
      try {
        uut.validate({ })
      } catch (err) {
        assert.include(err.message, "Property 'txid' must be a string!")
      }
    })

    it('should throw an error if about is not provided', () => {
      try {
        uut.validate({ txid: 'test' })
      } catch (err) {
        assert.include(err.message, "Property 'about' must be a string!")
      }
    })

    it('should throw an error if content is not provided', () => {
      try {
        uut.validate({ txid: 'test', about: 'test' })
      } catch (err) {
        assert.include(err.message, "Property 'content' must be a string!")
      }
    })

    it('should return a claim object', () => {
      const inObj = {
        txid: 'test',
        about: 'test',
        content: 'test'
      }

      const result = uut.validate(inObj)

      assert.property(result, 'txid')
      assert.property(result, 'about')
      assert.property(result, 'content')
    })
  })
})
