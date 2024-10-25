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
  modelInitiator: string
  jwtAccessSecret?: string
  jwtRefreshSecret?: string
  accessTokenLifeTime?: number
  cookieLifeTime?: number
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-sequelize',
    configKey: 'mySequelize',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const modelResolver = createResolver(nuxt.options.srcDir)

    // nuxt.options.alias['#color-mode-options'] = addTemplate({
    //   filename: 'color-mode-options.mjs',
    //   getContents: () => `export const ujiCoba = 'test'`,
    // }).dst

    nuxt.hook('nitro:config', (config) => {
      if (!config.virtual) {
        config.virtual = {}
      }
      config.virtual['#my-sequelize-options'] = [
        `import { ${_options.modelInitiator} } from '${modelResolver.resolve(_options.modelPath)}'`,
        `export const mySequelizeModelLoad = ${_options.modelInitiator}`,
        `export const mySequelizeOptions = ${JSON.stringify(_options)}`,
      ].join('\n')
    })

    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/server/plugins/sequelize'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))
  },
})
