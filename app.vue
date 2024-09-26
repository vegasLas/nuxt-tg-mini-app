<template>
  <div>
    <!-- <VCalendar /> -->
    <ClientOnly>
      <AppointmentScheduler />
    </ClientOnly>
      <!-- <MiniApp /> -->
  </div>
</template>

<script setup lang="ts">
import AppointmentScheduler from '~/components/AppointmentScheduler.vue'
</script>
