import type {
  Order,
  QueryOptions,
  WhereOptions } from 'sequelize'
import {
  Sequelize,
  QueryTypes,
} from 'sequelize'
import type { NitroApp } from 'nitropack'
import defu from 'defu'
import type { Knex } from 'knex'
import knex from 'knex'
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'
import { getHeader } from 'h3'
import type { QueryGenerator, RawQueryResult } from '../types'
import { mySequelizeModelLoad } from '#my-sequelize-options'

let _queryGenerator: QueryGenerator
let _builder: Knex
const _connection: { [key: string]: Sequelize } = {}

const createConnection = (identifier?: string) => {
  if (!_connection[identifier]) {
    _connection[identifier] = new Sequelize({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT ?? '3306'),
      // logging: false,
    })
  }
  _builder = knex({ client: _connection[identifier].getDialect() })
  _queryGenerator = _connection[identifier].getQueryInterface().queryGenerator as QueryGenerator
  return _connection[identifier]
}

const multiTenantDb = (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const tenantId = getHeader(event, 'tenant')
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
    nitroApp.hooks.hook('request', (event) => {
      mySequelizeModelLoad(connection)
      event.context.sequelize = connection
    })
  }
})

const methodToQueryTypes = {
  select: QueryTypes.SELECT,
  update: QueryTypes.UPDATE,
  insert: QueryTypes.INSERT,
  delete: QueryTypes.DELETE,
}

knex.QueryBuilder.extend('sequelizeWhere', function (where: WhereOptions) {
  const sql = _queryGenerator?.whereQuery(where) as string
  this.where(_builder.raw(sql.replace('WHERE', '')))
  return this
})

knex.QueryBuilder.extend('sequelizeOrder', function (order?: Order) {
  if (order) {
    const sql = _queryGenerator
      .selectQuery('DUMP', { order: order })
      .replace(';', '') as string
    this.orderByRaw(_builder.raw(sql.split('ORDER BY').at(1)!))
  }
  return this
})

export const raw = (
  sql: string,
  bindings?: Knex.RawBinding[] | Knex.ValueDict,
) => {
  if (bindings) return _builder.raw(sql, bindings)
  return _builder.raw(sql)
}

export const runQuery = async <T extends QueryTypes>(
  query: (builder: Knex) => Knex.QueryBuilder,
  options?: QueryOptions,
): Promise<RawQueryResult<T>> => {
  const sql = query(_builder).toSQL()
  const queryType = methodToQueryTypes[sql.method]
  return _sequelize.query(
    sql.sql,
    defu(
      {
        replacements: sql.bindings as [],
        type: queryType ?? QueryTypes.SELECT,
      },
      options,
    ),
  ) as unknown as RawQueryResult<typeof queryType>
}
