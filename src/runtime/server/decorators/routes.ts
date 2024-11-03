/* eslint-disable @typescript-eslint/no-explicit-any */
import { Reflection as Reflect } from '@abraham/reflection'
import type { AuthorizeRequest } from '../utils/event-handler'

export type MetadataValue = {
  route: string
  method: 'get' | 'put' | 'delete' | 'post'
  authorizeRequest?: AuthorizeRequest
}

export function get(route: string, authorizeRequest?: AuthorizeRequest): any {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('route::method', { route: route, method: 'get', authorizeRequest }, target, propertyKey)
  }
}

export function post(route: string, authorizeRequest?: AuthorizeRequest): any {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('route::method', { route: route, method: 'post', authorizeRequest }, target, propertyKey)
  }
}

export function del(route: string, authorizeRequest?: AuthorizeRequest): any {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('route::method', { route: route, method: 'del', authorizeRequest }, target, propertyKey)
  }
}

export function put(route: string, authorizeRequest?: AuthorizeRequest): any {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('route::method', { route: route, method: 'put', authorizeRequest }, target, propertyKey)
  }
}
