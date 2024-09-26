// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  app: {
    head: {
      script: [{ src: 'https://telegram.org/js/telegram-web-app.js' }],
    },
  },
  
  modules: [
    '@samk-dev/nuxt-vcalendar',
  ],

  // Add the following CSS configuration
  css: [
    '@/node_modules/vue-preloader/dist/style.css',
    '~/assets/css/telegram-theme.css',
  ],
})
