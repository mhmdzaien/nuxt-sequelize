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
import { useRuntimeConfig } from '@nuxt/kit'
// import { initModels } from '../models'

let _sequelize: Sequelize
let _queryGenerator: unknown
let _builder: Knex

const createConnection = () => {
  return new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT ?? '3306'),
    // logging: false,
  })
}

const multiTenantDb = (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const tenantId = getHeader(event, 'tenant')
    const connection = createConnection()
    event.context.sequelize = connection
    // initModels(connection)
  })
  nitroApp.hooks.hook('afterResponse', (event) => {
    event.context.sequelize?.close()
  })
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
  _sequelize = createConnection()
  _builder = knex({ client: _sequelize.getDialect() })
  _queryGenerator = _sequelize.getQueryInterface().queryGenerator

  console.log('testOption', useRuntimeConfig().pluginOption)
//   initModels(_sequelize)
  nitroApp.hooks.hook('request', (event) => {
    event.context.sequelize = _sequelize
  })
})

const methodToQueryTypes: { [key: string]: QueryTypes } = {
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
): Promise<
  T extends QueryTypes.SELECT
    ? unknown[]
    : T extends QueryTypes.INSERT
      ? [number, number]
      : T extends QueryTypes.UPDATE
        ? [undefined, number]
        : void
> => {
  const sql = query(_builder).toSQL()
  return _sequelize.query(
    sql.sql,
    defu(
      {
        replacements: sql.bindings as [],
        type: methodToQueryTypes[sql.method] ?? QueryTypes.SELECT,
      },
      options,
    ),
  )
}
