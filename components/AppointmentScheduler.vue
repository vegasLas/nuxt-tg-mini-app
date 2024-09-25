<template>
  <div>
    <h1>Appointment Scheduler</h1>
    <div v-if="loading">Loading available slots...</div>
    <div v-else>
      <ul>
        <li v-for="slot in availableSlots" :key="slot.id">
          {{ slot.time }}
          <button @click="bookAppointment(slot.id)">Book</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useTelegram } from 'vue-tg';

export default defineComponent({
  name: 'AppointmentScheduler',
  setup() {
    const { tg } = useTelegram();
    const availableSlots = ref([]);
    const loading = ref(true);

    onMounted(async () => {
      try {
        const response = await fetch('/api/appointments/available');
        availableSlots.value = await response.json();
      } catch (error) {
        console.error('Error fetching available slots:', error);
      } finally {
        loading.value = false;
      }
    });

    const bookAppointment = async (slotId: number) => {
      try {
        const response = await fetch(`/api/appointments/book/${slotId}`, {
          method: 'POST',
        });
        if (response.ok) {
          tg.sendData({ action: 'appointmentBooked', slotId });
          alert('Appointment booked successfully!');
        } else {
          alert('Failed to book appointment.');
        }
      } catch (error) {
        console.error('Error booking appointment:', error);
      }
    };

    return {
      availableSlots,
      loading,
      bookAppointment,
    };
  },
});
</script>

<style scoped>
/* Add your styles here */
</style>