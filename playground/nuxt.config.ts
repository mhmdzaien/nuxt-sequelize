export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  runtimeConfig: {
  },
  compatibilityDate: '2024-10-24',
  nitro: {
    esbuild: {
      options: {
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true,
          },
        },
      },
    },
  },
  nuxtSequelize: {
    modelInitiator: 'initModels',
    modelPath: './server/models',
  },
})
