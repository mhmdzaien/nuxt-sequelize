<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Nuxt Sequelize
- Package name: @mhmdzaien/nuxt-sequelize
- Description: Nuxt module to integrate sequelize
-->

# Nuxt Sequelize

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt module to integrate sequelize and model at server api 

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- &nbsp;Integrate with sequelize model
- &nbsp;Add controller support on server handler
- &nbsp;Authentication using token header

## Quick Setup

1.Install the module to your Nuxt application with one command:

```bash
npx nuxi@latest module add @mhmdzaien/nuxt-sequelize
```
2.Add @mhmdzaien/nuxt-sequelize, models path and nitro support decorator in nuxt.config.ts

```js
export default defineNuxtConfig({
  modules: [@mhmdzaien/nuxt-sequelize],
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
    modelPath: './server/models',
  },
})
```

3.Create index.js inside 'modelPath' that contain loader to model
```js
export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize)
}
```

That's it! You can now use My Module in your Nuxt app ✨

## Server utils

### defineMyEventHandler(handler, authorizeRequest?)
- handler : Function(event) => callback handler with event parameter
- authorizeRequest : "*" | Array<number> => if set handler check authentication in token header accepted role number
## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@mhmdzaien/nuxt-sequelize/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://www.npmjs.com/package/@mhmdzaien/nuxt-sequelize

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@mhmdzaien/nuxt-sequelize

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@mhmdzaien/nuxt-sequelize

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
