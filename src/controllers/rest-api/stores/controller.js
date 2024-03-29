/*
  Controller for the /store REST API endpoints.
*/

/* eslint-disable no-useless-escape */

class StoreController {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /store REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /store REST Controller.'
      )
    }

    // Bind 'this' object to all subfunctions
    this.all = this.all.bind(this)
    this.update = this.update.bind(this)
    this.box = this.box.bind(this)
    this.faucet = this.faucet.bind(this)
  }

  /**
   * @api {get} /store/all Get all stores
   * @apiName AllStores
   * @apiGroup Store
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5020/store/all
   *
   */
  async all (ctx) {
    try {
      // const stores = await this.adapters.localdb.Store.find({})

      const stores = await this.useCases.store.getAllSafeStores()

      ctx.body = {
        stores
      }
    } catch (err) {
      console.log('err: ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /store/update Update the mutable data for a token
   * @apiName UpdateStore
   * @apiGroup Store
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST localhost:5020/store/update -d '{ "tokenId": "ab6bc4ecb0c1b848dc98641787d2df90a84a3f8f38f7dc9e43f43b280e22df4c", "updateCache": true  }'
   *
   */
  async update (ctx) {
    try {
      // const stores = await this.adapters.localdb.Store.find({})
      const tokenId = ctx.request.body.tokenId
      const updateCache = ctx.request.body.updateCache

      const storeData = await this.useCases.store.updateMutableData(tokenId, updateCache)

      ctx.body = {
        storeData
      }
    } catch (err) {
      console.log('err: ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /store/box Get all stores within a box defined as map coordinates
   * @apiName BoxStores
   * @apiGroup Store
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST localhost:5020/store/box -d '{ "box": { "_northEast": { "lat": 52.20, "lng": -104.50 }, "_southWest": { "lat": 43.55, "lng": -142.12 } } }'
   *
   */
  async box (ctx) {
    try {
      const box = ctx.request.body.box
      // console.log('box controller: ', box)

      const stores = await this.useCases.store.filterStoresByBox({ box })
      // console.log('stores: ', stores)

      ctx.body = {
        stores
      }
    } catch (err) {
      console.log('err: ', err)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {post} /store/faucet Get a few cents of BCH to create a store with
   * @apiName Faucet
   * @apiGroup Store
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST localhost:5020/store/faucet -d '{ "bchAddress": "bitcoincash:qqlrzp23w08434twmvr4fxw672whkjy0py26r63g3d" }'
   *
   */
  async faucet (ctx) {
    try {
      const bchAddress = ctx.request.body.bchAddress

      const txid = await this.useCases.store.faucet.fundAddr({ bchAddress })

      ctx.body = {
        txid
      }
    } catch (err) {
      console.log('err: ', err)
      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

export default StoreController
