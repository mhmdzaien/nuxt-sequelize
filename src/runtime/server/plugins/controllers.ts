import type { NitroApp } from 'nitropack'
import { Reflection as Reflect } from '@abraham/reflection'
import type { MetadataValue } from '../decorators/routes'
import { defineMyEventHandler } from '../utils/event-handler'
import { myControllers } from '#my-sequelize-options'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  Object.keys(myControllers).forEach((controllerName) => {
    const controller = myControllers[controllerName].prototype
    Object.getOwnPropertyNames(controller).forEach((method) => {
      if (method !== 'constructor') {
        const routeMetadata = Reflect.getMetadata('route::method', controller, method) as MetadataValue
        if (routeMetadata) {
          nitroApp.router.add(routeMetadata.route, defineMyEventHandler(async function (event) {
            const objectDynamic = new myControllers[controllerName]()
            return objectDynamic[method](event)
          }, routeMetadata.authorizeRequest), routeMetadata.method)
        }
      }
    })
  })
})
