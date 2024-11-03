import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addServerImportsDir,
  addServerPlugin,
} from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
  modelPath: string
  modelInitiator?: string
  jwtAccessSecret?: string
  jwtRefreshSecret?: string
  accessTokenLifeTime?: number // in seconds
  cookieLifeTime?: number // in seconds
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mhmdzaien/nuxt-sequelize',
    configKey: 'nuxtSequelize',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    modelInitiator: 'initModels',
    jwtAccessSecret: 'no-key-access',
    jwtRefreshSecret: 'no-key-refresh',
    accessTokenLifeTime: 60 * 60 * 2,
    cookieLifeTime: 60 * 60 * 24 * 30,
  },
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const modelResolver = createResolver(nuxt.options.rootDir)

    nuxt.hook('nitro:config', (config) => {
      if (!config.virtual) {
        config.virtual = {}
      }
      config.virtual['#my-sequelize-options'] = [
        `import { ${_options.modelInitiator} } from '${modelResolver.resolve(_options.modelPath)}'`,
        `export const mySequelizeModelLoad = ${_options.modelInitiator}`,
        `export const mySequelizeOptions = ${JSON.stringify(_options)}`,
        `import * as controllerCollection from '${nuxt.options.serverDir}/controllers'`,
        `export const myControllers = controllerCollection`,
      ].join('\n')
    })

    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/server/plugins/sequelize'))
    addServerPlugin(resolver.resolve('./runtime/server/plugins/controllers'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))
    addServerImportsDir(resolver.resolve('./runtime/server/decorators'))
  },
})
