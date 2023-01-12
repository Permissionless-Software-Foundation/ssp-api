/*
  Store Entity

  Entities are used to validate input data the represents an entity. If the
  data values don't match expected patterns, the creation of the new entity
  is rejects by throwing an error.
*/

class StoreEntity {
  validate (inObj = {}) {
    const { name, ticker, tokenId, documentHash, type, isSsp } = inObj

    // Input Validation
    if (!name || typeof name !== 'string') {
      throw new Error("Property 'name' must be a string!")
    }
    if (!tokenId || typeof tokenId !== 'string') {
      throw new Error("Property 'tokenId' must be a string!")
    }
    if (!documentHash || typeof documentHash !== 'string') {
      throw new Error("Property 'documentHash' must be a string!")
    }

    if (!ticker.includes('SSP')) {
      throw new Error('Store token must have a ticker that includes SSP')
    }

    if (type !== 129) {
      throw new Error('Store token must by a Group token (type 129)')
    }

    if (!isSsp) {
      throw new Error('psf-slp-indexer must identify the token as a SSP token.')
    }

    // if (!Array.isArray(storeData.keywords)) {
    //   throw new Error('JSON LD for store data must contain a keywords array')
    // }

    return inObj
  }
}

export default StoreEntity
