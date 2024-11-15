export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  runtimeConfig: {
  },
  compatibilityDate: '2024-10-24',
  nuxtSequelize: {
    jwtAccessSecret: "Test",
    jwtRefreshSecret: "IniTestRefresh",
    accessTokenLifeTime: 60 * 60 * 3, // in seconds
    cookieLifeTime: 60 * 60 * 24,
    redis: {
      port: process.env.REDIS_PORT!,
      host: process.env.REDIS_HOST!,
      password: process.env.REDIS_PASSWORD!,
      username: process.env.REDIS_USER!,
      database: 2,
    },
  },
})
