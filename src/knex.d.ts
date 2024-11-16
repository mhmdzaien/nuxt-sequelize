import 'knex'

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder {
      functionName(): Knex.ColumnBuilder
    }
  }
}
