<template>
  <div>
    <VuePreloader
      background-color="#091a28"
      color="#ffffff"
      transition-type="fade-up"
      :loading-speed="25"
      :transition-speed="1000"
    ></VuePreloader>
    <ClientOnly>
      <AppointmentScheduler />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import AppointmentScheduler from '~/components/AppointmentScheduler.vue'
import { VuePreloader } from 'vue-preloader';
</script>