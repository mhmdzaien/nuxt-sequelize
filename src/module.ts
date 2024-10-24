import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addServerImportsDir,
  addServerPlugin,
} from '@nuxt/kit'
import type { Sequelize } from 'sequelize'

// Module options TypeScript interface definition
export interface ModuleOptions {
  initModel: (sequelize: Sequelize) => void
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-sequelize',
    configKey: 'mySequelize',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)


    _nuxt.options.runtimeConfig.pluginOption = _options
    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
    addServerPlugin(resolver.resolve('./runtime/server/plugins/sequelize'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))
  },
})
