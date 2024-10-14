import { defineNuxtPlugin } from '#app'
import BeatLoader from 'vue-spinner/src/BeatLoader.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('BeatLoader', BeatLoader)
})