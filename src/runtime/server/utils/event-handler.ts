import type { Hooks } from 'crossws'

import {
  type EventHandler,
  type EventHandlerResolver,
  type EventHandlerResponse,
  type EventHandlerRequest,
  type H3Event,
  type H3EventContext,
  getCookie,
  defineEventHandler,
  setResponseStatus,
} from 'h3'
import type { Sequelize } from 'sequelize'
import type { ZodIssue } from 'zod'
import {
  verifyToken,
  type AccessTokenPayload,
} from './authentication'

interface MyH3EventContext extends H3EventContext {
  decodedToken?: AccessTokenPayload
  sequelize: Sequelize
}

interface MyH3Event<T extends EventHandlerRequest> extends H3Event<T> {
  context: MyH3EventContext
}
interface MyEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response extends EventHandlerResponse = EventHandlerResponse,
> {
  __is_handler__?: true
  __resolve__?: EventHandlerResolver
  __websocket__?: Partial<Hooks>
  (event: MyH3Event<Request>): Response
}

const extractToken = async (
  event: H3Event<EventHandlerRequest>,
): Promise<AccessTokenPayload | undefined> => {
  const tokenCookies = getCookie(event, 'accessToken')
  if (tokenCookies) {
    try {
      const decodedToken = await verifyToken(tokenCookies, 'access')
      return decodedToken as AccessTokenPayload
    }
    catch (err) {
      console.log(err)
      return undefined
    }
  }
  return undefined
}

export const defineMyEventHandler = <T extends EventHandlerRequest, D>(
  handler: MyEventHandler<T, D>, // EventHandler<T, D>,
  authorizeRequest?: boolean | Array<number>,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      const decodedToken = await extractToken(event)
      event.context.decodedToken = decodedToken
      if (authorizeRequest && !decodedToken) {
        throw {
          statusCode: 401,
          message: 'Anda tidak terotentifikasi',
        }
      }
      else if (
        Array.isArray(authorizeRequest)
        && !authorizeRequest.includes(decodedToken!.role as number)
      ) {
        throw {
          statusCode: 403,
          message: 'Anda tidak memiliki akse ke fitur ini',
        }
      }
      return await handler(event as MyH3Event<T>)
    }
    catch (err) {
      setResponseStatus(event, err.statusCode ?? 500)
      if (err.statusCode === 422) {
        err.data = err.data?.reduce((validation: object, row: ZodIssue) => {
          const key = row.path.join('.') as string
          return { ...validation, ...{ [key]: row.message } }
        }, {})
      }
      else {
        console.log(err.stack)
      }
      return {
        code: err.code ?? err.statusCode,
        message: err.statusMessage ?? err.message,
        details: err.data,
      }
    }
  })
