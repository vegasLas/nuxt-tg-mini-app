<template>
  <Meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <ClientOnly>
      <VuePreloader
        background-color="#091a28"
        color="#ffffff"
        transition-type="fade-up"
        :loading-speed="25"
        :transition-speed="1000"
      ></VuePreloader>
      <Main :style="{ visibility: showMain ? 'visible' : 'hidden' }" />
    </ClientOnly>
</template>

<script setup lang="ts">
import { VuePreloader } from "vue-preloader";
const showMain = ref(false)
setTimeout(() => {
  showMain.value = true
}, 1000)
</script>
