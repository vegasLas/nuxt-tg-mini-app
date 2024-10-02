<template>
    <VuePreloader
      background-color="#091a28"
      color="#ffffff"
      transition-type="fade-up"
      :loading-speed="25"
      :transition-speed="1000"
    ></VuePreloader>
    <NuxtPage />
    <ClientOnly>
      <Main />
    </ClientOnly>
</template>

<script setup lang="ts">
import { VuePreloader } from "vue-preloader";
</script>