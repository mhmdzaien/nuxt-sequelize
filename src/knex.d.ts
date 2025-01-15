import 'knex'

declare module 'knex' {
  namespace Knex {
    interface QueryInterface {
      sequelizeWhere(): Knex.QueryBuilder
      sequelizeOrder(): Knex.QueryBuilder
    }
  }
}
