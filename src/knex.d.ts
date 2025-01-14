import 'knex'

declare module 'knex' {
  namespace Knex {
    interface QueryInterface<TRecord extends {} = any, TResult = any> {
      sequelizeWhere(): Knex.QueryBuilder
      sequelizeOrder(): Knex.QueryBuilder
    }
  }
}
