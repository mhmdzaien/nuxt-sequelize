import { type H3Event, type EventHandlerRequest, setCookie, createError } from 'h3'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
// ts-ignore:next-line
import { mySequelizeOptions } from '#my-sequelize-options'
import { useStorage } from '#imports'

export interface AccessTokenPayload {
  jwtId: string
  id: string | number
  role?: string | number | undefined
  [key: string]: string | number | object | undefined
}

export type UserPayload = {
  id: string | number
  role?: string | number | undefined
  [key: string]: string | number | object | undefined
}

const {
  jwtAccessSecret,
  jwtRefreshSecret,
  accessTokenLifeTime,
  cookieLifeTime,
} = mySequelizeOptions

export const encodeAccessToken = (
  userPayload: UserPayload,
  attachOnCookie?: boolean,
  event?: H3Event<EventHandlerRequest>,
) => {
  const payload = {
    jwtId: uuidv4(),
    ...userPayload,
  }
  const token = jwt.sign(payload, (jwtAccessSecret ?? 'no-key') as string, {
    expiresIn: (accessTokenLifeTime ?? 60),
  })
  if (attachOnCookie && event) {
    setCookie(event, 'accessToken', token, {
      expires: new Date(Date.now() + (cookieLifeTime ?? 60) * 1000),
    })
  }
  else if (attachOnCookie === true && !event) {
    throw createError({
      statusCode: 500,
      message: 'Event handler required',
    })
  }
  return token
}

export const revokeToken = (token: string, type: 'access' | 'refresh') => {
  try {
    const decodeToken = jwt.verify(token, type === 'access' ? (jwtAccessSecret ?? 'no-key') : (jwtRefreshSecret ?? 'no-key')) as { jwtId: string, exp: number }
    const currentTimestampSecond = Math.floor(Date.now() / 1000)
    const ttl = decodeToken.exp - currentTimestampSecond + 5
    useStorage('sqlite-cache').setItem(decodeToken.jwtId, 'expired', { ttlSecond: ttl })
  }
  catch (error) {
    console.log(error)
  }
}

export const encodeRefreshToken = (userId: string) => {
  return jwt.sign(
    {
      jwtId: uuidv4(),
      userId: userId,
    },
    (jwtRefreshSecret ?? 'no-key') as string,
    { expiresIn: (cookieLifeTime ?? 60) },
  )
}

export const verifyToken = async (
  token: string,
  type: 'access' | 'refresh',
): Promise<JwtPayload & { jwtId: string, [key: string]: string | number | object }> => {
  try {
    const decodeToken = jwt.verify(
      token,
      type === 'access' ? (jwtAccessSecret ?? 'no-key') : (jwtRefreshSecret ?? 'no-key'),
    ) as AccessTokenPayload
    if (import.meta.server) {
      if (await useStorage('sqlite-cache').hasItem(decodeToken.jwtId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Token tidak valid',
        })
      }
    }
    return decodeToken
  }
  catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token tidak valid',
      cause: error,
    })
  }
}
