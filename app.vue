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
      <AppointmentCalendar />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">

import AppointmentCalendar from '~/components/AppointmentCalendar.vue'
import { VuePreloader } from 'vue-preloader';

</script>