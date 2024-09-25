<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppointmentScheduler />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AppointmentScheduler from './components/AppointmentScheduler.vue';

export default defineComponent({
  name: 'App',
  components: {
    AppointmentScheduler,
  },
});
</script>
