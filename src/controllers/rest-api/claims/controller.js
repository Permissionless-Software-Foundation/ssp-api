/*
  Controller for the /store REST API endpoints.
*/

/* eslint-disable no-useless-escape */

class ClaimController {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /claim REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /claim REST Controller.'
      )
    }

    // Bind 'this' object to all subfunctions
    this.all = this.all.bind(this)
  }

  /**
   * @api {get} /claim/all Get all stores
   * @apiName AllStores
   * @apiGroup Store
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5020/claim/all
   *
   */
  async all (ctx) {
    try {
      const claims = await this.adapters.localdb.Claim.find({})

      ctx.body = {
        claims
      }
    } catch (err) {
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

export default ClaimController
