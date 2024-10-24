export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  runtimeConfig: {
  },
  compatibilityDate: '2024-10-24',
  mySequelize: {
    modelInitiator: 'initModels',
    modelPath: './server/models',
  },
})
