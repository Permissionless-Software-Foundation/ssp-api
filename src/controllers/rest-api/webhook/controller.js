/*
  Controller for the /webhook REST API endpoints.
*/

/* eslint-disable no-useless-escape */

class WebhookController {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /webhook REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /webhook REST Controller.'
      )
    }

    // Bind 'this' object to all subfunctions
    this.token = this.token.bind(this)
  }

  /**
   * @api {post} /webhook/token New SSP Token
   * @apiName NewToken
   * @apiGroup Webhook
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "ticker": "SSP-287262", "documentHash": "30cedeefa81ad5ee077641607ac1416415759e6d6cfb2de6bd78d491d8dcd3c5" }' localhost:5020/webhook/token
   *
   */
  async token (ctx) {
    try {
      const data = ctx.request.body
      console.log('webook/token data: ', data)

      // const emailObj = data.obj
      // await _this.contactLib.sendEmail(emailObj)

      let store = await this.useCases.store.createStore(data)

      // Try to retrieve mutable data for the token, but don't let this prevent
      // the flow if it fails.
      try {
        store = await this.useCases.store.updateMutableData(store.tokenId)
      } catch (err) {}

      ctx.body = {
        store
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
export default WebhookController
