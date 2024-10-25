import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  nuxtSequelize: {
    modelInitiator: 'initModels',
    modelPath: '../../../playground/server/models',
  },
})
