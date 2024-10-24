import { type EventHandlerRequest, type H3Event, getRequestURL } from 'h3'
import type { Order } from 'sequelize'
import { Op, Sequelize } from 'sequelize'
import { parse } from 'qs'
import type { FilterQuery } from '../types'

const mapsOperator: { [key: string]: symbol } = {
  contain: Op.substring,
  is: Op.is,
  eq: Op.eq,
  ne: Op.ne,
  gt: Op.gt,
  gte: Op.gte,
  lt: Op.lt,
  lte: Op.lte,
  in: Op.in,
  notIn: Op.notIn,
  or: Op.or,
  and: Op.and,
}

export const toSequelizeOp = (options: Array<string> | object): object => {
  if (Array.isArray(options)) {
    options.forEach((val, index) => {
      options[index] = toSequelizeOp(val)
    })
    return options
  }
  else if (typeof options === 'object') {
    return Object.fromEntries(
      Object.entries(options).map(([k, v]) => {
        if (mapsOperator[k]) {
          return [mapsOperator[k], toSequelizeOp(v)]
        }
        else if (typeof v === 'object') {
          const col = k.split('.').length > 1 ? `$${k}$` : k
          return [col, toSequelizeOp(v)]
        }
        const col = k.split('.').length > 1 ? `$${k}$` : k
        return [col, v]
      }),
    )
  }
  return options
}

export const useQuery = (event: H3Event<EventHandlerRequest>): FilterQuery => {
  const query = getRequestURL(event).search
  if (query) {
    return parse(query, { ignoreQueryPrefix: true })
  }
  return {}
}

export const useGridParam = (event: H3Event<EventHandlerRequest>) => {
  const {
    page,
    rowsPerPage,
    where,
    search,
    sortBy,
    sortType,
    attributes,
  }: FilterQuery = useQuery(event)
  const whereQuery = []
  if (where) {
    whereQuery.push(toSequelizeOp(where))
  }
  if (search) {
    whereQuery.push({ [Op.or]: toSequelizeOp(search) })
  }
  let order: Order | undefined
  if (sortBy && sortType) {
    if (sortBy.split('.').length > 0) {
      order = [[Sequelize.literal(sortBy), sortType]]
    }
    else {
      order = [[sortBy, sortType]]
    }
  }
  const limit = rowsPerPage == '-1' ? undefined : Number(rowsPerPage ?? 10)
  const offset = Number(rowsPerPage ?? 10) * (Number(page ?? 1) - 1)
  return {
    limit,
    offset,
    order,
    attributes,
    where: { [Op.and]: whereQuery },
  }
}
