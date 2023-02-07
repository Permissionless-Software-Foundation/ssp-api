/*
  REST API library for /webhook route.
*/

// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import StoreRESTControllerLib from './controller.js'

class StoreRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Store REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Store REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.storeRESTController = new StoreRESTControllerLib(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/store'
    this.router = new Router({ prefix: baseUrl })
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.get('/all', this.storeRESTController.all)
    this.router.post('/update', this.storeRESTController.update)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

export default StoreRouter
