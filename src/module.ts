import { existsSync } from 'node:fs'
import {
  defineNuxtModule,
  createResolver,
  addServerImportsDir,
  addServerPlugin,
} from '@nuxt/kit'
import type { Dialect } from 'sequelize'
import type { NitroConfig } from 'nitropack'
import type { PersistentNodeCacheOptions } from './runtime/types'
// Module options TypeScript interface definition
export interface ModuleOptions {
  modelPath?: string
  modelInitiator?: string
  jwtAccessSecret?: string
  jwtRefreshSecret?: string
  accessTokenLifeTime?: number // in seconds
  cookieLifeTime?: number // in seconds
  connection?: {
    dialect: Dialect
    host: string
    username: string
    password: string
    database: string
    port: number
  }
  nodeCacheOptions?: PersistentNodeCacheOptions
}

function initNitroConfig(nitroOptions: NitroConfig): NitroConfig {
  nitroOptions.esbuild = {
    options: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
        },
      },
    },
  }
  nitroOptions.externals = {
    traceInclude: [
      'node_modules/knex/knex.js',
    ],
  }
  return nitroOptions
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mhmdzaien/nuxt-sequelize',
    configKey: 'nuxtSequelize',
    compatibility: {
      nuxt: '>=3.5.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    modelPath: './server/models',
    modelInitiator: 'initModels',
    jwtAccessSecret: 'no-key-access',
    jwtRefreshSecret: 'no-key-refresh',
    accessTokenLifeTime: 60 * 60 * 2,
    cookieLifeTime: 60 * 60 * 24 * 30,
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const modelResolver = createResolver(nuxt.options.rootDir)
    nuxt.options.nitro = initNitroConfig(nuxt.options.nitro)
    nuxt.hook('nitro:config', (config) => {
      if (!config.virtual) {
        config.virtual = {}
      }
      const loader = [
        `import { ${_options.modelInitiator} } from '${modelResolver.resolve(
          _options.modelPath!,
        )}'`,
        `export const mySequelizeModelLoad = ${_options.modelInitiator}`,
        `export const mySequelizeOptions = ${JSON.stringify(_options)}`,
      ]
      if (existsSync(`${nuxt.options.serverDir}/controllers`)) {
        loader.push(
          `import * as controllerCollection from '${nuxt.options.serverDir}/controllers'`,
        )
        loader.push(`export const myControllers = controllerCollection`)
      }
      config.virtual['#my-sequelize-options'] = loader.join('\n')
    })
    addServerPlugin(resolver.resolve('./runtime/server/plugins/sequelize'))
    addServerPlugin(resolver.resolve('./runtime/server/plugins/node-cache.storage'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))
    addServerImportsDir(resolver.resolve('./runtime/server/decorators'))
    if (existsSync(`${nuxt.options.serverDir}/controllers`)) {
      addServerPlugin(resolver.resolve('./runtime/server/plugins/controllers'))
    }
  },
})
