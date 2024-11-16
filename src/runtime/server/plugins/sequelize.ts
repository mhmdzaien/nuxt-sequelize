import type {
  Dialect } from 'sequelize'
import {
  Sequelize,
} from 'sequelize'
import type { NitroApp } from 'nitropack'
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { getHeader } from 'h3'
import { initConnection } from '../utils/knex-utils'
import { mySequelizeModelLoad } from '#my-sequelize-options'

const _connection: { [key: string]: Sequelize } = {}

const createConnection = (identifier: string) => {
  if (!_connection[identifier]) {
    _connection[identifier] = new Sequelize({
      dialect: process.env.DB_DRIVER as Dialect ?? 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? '',
      port: Number(process.env.DB_PORT ?? '3306'),
      // logging: false,
    })
  }
  initConnection(_connection[identifier])
  return _connection[identifier]
}

const multiTenantDb = (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const tenantId = getHeader(event, 'tenant') ?? 'default'
    const connection = createConnection(tenantId)
    event.context.sequelize = connection
    mySequelizeModelLoad(connection)
  })
  nitroApp.hooks.hook('afterResponse', (event) => {
    event.context.sequelize?.close()
  })
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const moduleOptions = { enabledMultitenant: false }
  if (moduleOptions.enabledMultitenant) {
    multiTenantDb(nitroApp)
  }
  else {
    const connection = createConnection('default')
    nitroApp.hooks.hookOnce('request', (event) => {
      mySequelizeModelLoad(connection)
      event.context.sequelize = connection
    })
  }
})
