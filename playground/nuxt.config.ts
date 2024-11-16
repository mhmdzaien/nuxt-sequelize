export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n'],
  devtools: { enabled: true },
  runtimeConfig: {
  },

  compatibilityDate: '2024-10-24',
  i18n: {
    experimental: {
      localeDetector: 'localeDetector.ts',
    },
  },
  nuxtSequelize: {
    jwtAccessSecret: 'Test',
    jwtRefreshSecret: 'IniTestRefresh',
    accessTokenLifeTime: 60 * 60 * 3, // in seconds
    cookieLifeTime: 60 * 60 * 24,
  },
})
