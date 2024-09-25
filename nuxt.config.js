export default defineNuxtConfig({
  mode: 'universal',
  srcDir: 'app/',
  buildModules: [
    '@nuxt/typescript-build',
  ],
  modules: [
    // Add any other modules you need
  ],
  build: {
    extend(config, ctx) {
      // Extend webpack config here
    }
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
})