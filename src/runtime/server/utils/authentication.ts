import { useRuntimeConfig } from '@nuxt/kit'
import { compare, genSaltSync, hashSync } from 'bcrypt'
import { type H3Event, type EventHandlerRequest, setCookie, createError } from 'h3'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export const hashPassword = (password: string) => {
  const salt = genSaltSync(10)
  return hashSync(password, salt)
}

export const comparePassword = (password: string, hashPassword: string) =>
  compare(password, hashPassword).then(resp => resp)

export interface AccessTokenPayload {
  jwtId: string
  [key: string]: string | number | object
  id: string | number
  role: string | number
  username: string
  name: string
}

export type UserPayload = {
  id: string | number
  trueUserId?: string
  username?: string
  role?: string | number
  name?: string
  [key: string]: string | number | object
}

const {
  jwtAccessSecret,
  jwtRefreshSecret,
  accessTokenLifeTime,
  public: publicConfig,
} = useRuntimeConfig()

export const encodeAccessToken = (
  userPayload: UserPayload,
  attachOnCookie?: boolean,
  event?: H3Event<EventHandlerRequest>,
) => {
  const payload: AccessTokenPayload = {
    jwtId: uuidv4(),
    ...{
      id: userPayload.id,
      trueUserId: userPayload.trueUserId,
      username: userPayload.username,
      role: userPayload.role,
      name: userPayload.name,
      unitId: userPayload.unitId,
    },
  }
  const token = jwt.sign(payload, jwtAccessSecret as string, {
    expiresIn: accessTokenLifeTime,
  })
  if (attachOnCookie && event) {
    setCookie(event, 'accessToken', token, {
      expires: new Date(Date.now() + publicConfig.cookieLifeTime * 1000),
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

export const encodeRefreshToken = (userId: string) => {
  return jwt.sign(
    {
      jwtId: uuidv4(),
      userId: userId,
    },
    jwtRefreshSecret as string,
    { expiresIn: publicConfig.cookieLifeTime },
  )
}

export const verifyToken = async (
  token: string,
  type: 'access' | 'refresh',
): Promise<JwtPayload & { jwtId: string, [key: string]: string | number | object }> => {
  try {
    const decodeToken = jwt.verify(
      token,
      type === 'access' ? jwtAccessSecret : jwtRefreshSecret,
    ) as AccessTokenPayload
    if (import.meta.server && process.env.REDIS_HOST) {
      if (await useStorage('redis').hasItem(decodeToken.jwtId)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Token tidak valid',
        })
      }
    }
    return decodeToken
  }
  catch (error) {
    console.log(error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Token tidak valid',
    })
  }
}
