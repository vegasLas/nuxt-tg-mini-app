<template>
  <Meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <VuePreloader
      background-color="#091a28"
      color="#ffffff"
      transition-type="fade-up"
      :loading-speed="25"
      :transition-speed="1000"
    ></VuePreloader>
    <ClientOnly>
      <Main />
    </ClientOnly>
</template>

<script setup lang="ts">
import { VuePreloader } from "vue-preloader";
</script>