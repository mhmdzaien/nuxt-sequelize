import type { FindAttributeOptions, QueryTypes, WhereOptions } from 'sequelize'

export interface QueryGenerator {
  whereQuery(where: WhereOptions)
  selectQuery(tableName, options?, model?): string
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
