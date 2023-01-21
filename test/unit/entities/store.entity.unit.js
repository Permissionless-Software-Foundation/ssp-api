/*
  Unit tests for the Store entity library.
*/

import { assert } from 'chai'

import sinon from 'sinon'
import StoreEntity from '../../../src/entities/store-entity.js'

let sandbox
let uut

describe('#Store-Entity', () => {
  before(async () => {})

  beforeEach(() => {
    uut = new StoreEntity()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#validate', () => {
    it('should throw an error if name is not provided', () => {
      try {
        uut.validate({ })
      } catch (err) {
        assert.include(err.message, "Property 'name' must be a string!")
      }
    })

    it('should throw an error if tokenId is not provided', () => {
      try {
        uut.validate({ name: 'test' })
      } catch (err) {
        assert.include(err.message, "Property 'tokenId' must be a string!")
      }
    })

    it('should throw an error if documentHash is not provided', () => {
      try {
        uut.validate({ name: 'test', tokenId: 'test' })
      } catch (err) {
        assert.include(err.message, "Property 'documentHash' must be a string!")
      }
    })

    it('should throw an error if ticker is not provided', () => {
      try {
        uut.validate({ name: 'test', tokenId: 'test', documentHash: 'test' })
      } catch (err) {
        assert.include(err.message, 'Cannot read')
      }
    })

    it('should throw an error if ticker does not contain SSP', () => {
      try {
        uut.validate({ name: 'test', tokenId: 'test', documentHash: 'test', ticker: 'test' })
      } catch (err) {
        assert.include(err.message, 'Store token must have a ticker that includes SSP')
      }
    })

    it('should throw an error if type is not provided', () => {
      try {
        uut.validate({ name: 'test', tokenId: 'test', documentHash: 'test', ticker: 'SSP' })
      } catch (err) {
        assert.include(err.message, 'Store token must')
      }
    })

    it('should throw an error if ticker is not provided', () => {
      try {
        uut.validate({ name: 'test', tokenId: 'test', documentHash: 'test', ticker: 'SSP', type: 129 })
      } catch (err) {
        assert.include(err.message, 'psf-slp-indexer must identify the token as a SSP token.')
      }
    })

    it('should return a store object', () => {
      const inObj = {
        name: 'test',
        tokenId: 'test',
        documentHash: 'test',
        ticker: 'SSP',
        type: 129,
        isSsp: true
      }

      const result = uut.validate(inObj)

      assert.property(result, 'name')
      assert.property(result, 'tokenId')
      assert.property(result, 'documentHash')
      assert.property(result, 'ticker')
      assert.property(result, 'type')
      assert.property(result, 'isSsp')
    })
  })
})
