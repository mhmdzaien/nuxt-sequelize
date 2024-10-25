import type { FindAttributeOptions, FindOptions, Model, ModelStatic, QueryTypes, TableName, WhereOptions } from 'sequelize'

type SelectOptions<M extends Model> = FindOptions<M> & {
  model: ModelStatic<M>
}

export interface QueryGenerator {
  whereQuery(where: WhereOptions): string
  selectQuery<M extends Model>(tableName: TableName, options?: SelectOptions<M>, model?: ModelStatic<M>): string
}

export interface FilterQuery {
  page?: string
  rowsPerPage?: string
  where?: object
  search?: object
  sortBy?: string
  sortType?: string
  attributes?: FindAttributeOptions
}

export type RawQueryResult<T> = T extends QueryTypes.SELECT
  ? unknown[]
  : T extends QueryTypes.INSERT
    ? [number, number]
    : T extends QueryTypes.UPDATE
      ? [undefined, number]
      : undefined
