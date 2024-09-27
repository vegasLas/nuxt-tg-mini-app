<template>
  <div>
    <!-- <VCalendar /> -->
    <ClientOnly>
      <AppointmentScheduler />
    </ClientOnly>
    <VuePreloader
    background-color="#091a28"
    color="#ffffff"
    transition-type="fade-up"
    :loading-speed="25"
    :transition-speed="1000"
    @loading-is-over="loadingIsOver"
    @transition-is-over="transitionIsOver"
  ></VuePreloader>
      <!-- <MiniApp /> -->
  </div>
</template>

<script setup lang="ts">
import AppointmentScheduler from '~/components/AppointmentScheduler.vue'
import { VuePreloader } from 'vue-preloader';
const loadingIsOver = () => {
  console.log('loading is over')
}

const transitionIsOver = () => {
  console.log('transition is over')
}
</script>