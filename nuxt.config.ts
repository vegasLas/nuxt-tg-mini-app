// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  routeRules: {
    '/api/**': { cors: false },
  },
  app: {
    head: {
      link: [{ rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' }],
      script: [{ src: 'https://telegram.org/js/telegram-web-app.js' }],
    },
  },
  runtimeConfig: {
    public: {
      INIT_DATA_SECRET: process.env.INIT_DATA_SECRET,
    }
  },
  modules: ['@samk-dev/nuxt-vcalendar', '@pinia/nuxt'],
  css: [
    '@/node_modules/notie/dist/notie.css',
    '@/node_modules/vue-preloader/dist/style.css',
    '~/assets/css/telegram-theme.css',
    '~/styles/global.css',
  ],
  plugins: [
    '~/plugins/spinner.ts'
  ],
})
