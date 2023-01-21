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
