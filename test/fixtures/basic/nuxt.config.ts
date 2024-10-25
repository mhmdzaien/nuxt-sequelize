import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  mySequelize: {
    modelInitiator: 'initModels',
    modelPath: '../../../playground/server/models',
  },
})
