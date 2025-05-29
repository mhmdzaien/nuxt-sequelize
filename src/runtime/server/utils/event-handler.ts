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
  type UserPayload,
  verifyToken,
  type AccessTokenPayload,
} from './authentication'

interface MyH3EventContext extends H3EventContext {
  decodedToken?: AccessTokenPayload
  sequelize: Sequelize
}

export type AuthorizeRequest = '*' | Array<number> | ((currentUser: UserPayload) => boolean)
export interface MyH3Event<T extends EventHandlerRequest> extends H3Event<T> {
  context: MyH3EventContext
}
export interface MyEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  Response extends EventHandlerResponse = EventHandlerResponse,
> {
  __is_handler__?: true
  __resolve__?: EventHandlerResolver
  __websocket__?: Partial<Hooks>
  (event: MyH3Event<Request>): Response
}

export const extractToken = async (
  event: H3Event<EventHandlerRequest>,
): Promise<AccessTokenPayload | undefined> => {
  const tokenCookies = getCookie(event, 'accessToken')
  if (tokenCookies) {
    try {
      const decodedToken = await verifyToken(tokenCookies, 'access')
      return decodedToken as AccessTokenPayload
    }
    catch (err) {
      if (err instanceof Error) {
        console.log(err.message)
      }
      return undefined
    }
  }
  return undefined
}

export const defineMyEventHandler = <T extends EventHandlerRequest, D>(
  handler: MyEventHandler<T, D>,
  authorizeRequest?: AuthorizeRequest,
): EventHandler<T, D> =>
  defineEventHandler<T>(async (event) => {
    try {
      const decodedToken = await extractToken(event)
      event.context.decodedToken = decodedToken
      if ((authorizeRequest || authorizeRequest === '*') && !decodedToken) {
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
      else if (typeof authorizeRequest === 'function' && !authorizeRequest(decodedToken!)) {
        throw {
          statusCode: 403,
          message: 'Anda tidak memiliki akses ke fitur ini',
        }
      }
      return await handler(event as MyH3Event<T>)
    }
    catch (err) {
      const error = err as unknown as { code: number, message: string, statusCode: number, data?: unknown, stack: unknown, statusMessage?: string }
      setResponseStatus(event, error.statusCode ?? 500)
      if (error.statusCode === 422) {
        error.data = error.data?.reduce((validation: object, row: ZodIssue) => {
          const key = row.path.join('.') as string
          return { ...validation, ...{ [key]: row.message } }
        }, {})
      }
      else {
        console.log(error.stack)
      }
      return {
        code: error.code ?? error.statusCode,
        message: error.statusMessage ?? error.message,
        details: error.data,
      }
    }
  })
