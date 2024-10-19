<template>
  <div class="admin-appointments-list">
    <DateSlider :initial-date="adminStore.currentDate" @date-change="adminStore.onDateChange" />
    <div class="appointments-container">
      <div v-if="adminStore.isLoading" class="loader-container">
        <BeatLoader color="#000000" size="10px" />
      </div>
      <template v-else>
        <div v-if="adminStore.filteredAppointments.length === 0" class="no-appointments">
          Нет записей на этот день
        </div>
        <div v-else class="appointments-list">
          <div v-for="appointment in adminStore.filteredAppointments" :key="appointment.id" class="appointment-item">
            <div class="appointment-time">{{ formatTime(appointment.time) }}</div>
            <div class="appointment-details">
              <div><strong>Имя:</strong> {{ appointment.name }}</div>
              <div><strong>Телефон:</strong> {{ appointment.phoneNumber }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import DateSlider from './DateSlider.vue'
import { parseISO } from 'date-fns'

const adminStore = useAdminStore()

function formatTime(time: string) {
  return formatDateTime(parseISO(time)).split(' ')[1]
}

onMounted(() => {
  adminStore.fetchAppointmentsByDate(adminStore.currentDate)
})
</script>

<style scoped>
.admin-appointments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px 20px 20px;
}

.appointments-container {
  min-width: 350px;
  min-height: 60vh;
  margin: 0 auto;
  padding: 0.7rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appointment-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.appointment-time {
  font-size: 18px;
  font-weight: bold;
  min-width: 60px;
  color: #495057;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #495057;
}

.no-appointments {
  text-align: center;
  font-style: italic;
  color: #adb5bd;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
} 

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #ffffff;
  border-radius: 8px;
}
</style>
