<template>
  <div class="appointments-list">
    <h2>Мои записи</h2>
    <div v-if="appointments.length === 0" class="no-appointments">
      У вас нет запланированных записей.
    </div>
    <ul v-else>
      <li v-for="appointment in appointments" :key="appointment.id" class="appointment-item">
        <div class="appointment-info">
          <div class="date-time">
            {{ formatDateTime(appointment.time) }}
          </div>
          <!-- <div class="service">{{ appointment }}</div> -->
        </div>
        <div class="appointment-actions">
          <button @click="rescheduleAppointment(appointment)" class="action-button reschedule">
            Перенести
          </button>
          <Popup message="Отменить" title="Вы уверены, что хотите отменить эту запись?" @click="removeAppointment(appointment.id)" class="action-button remove"/>
        </div>
      </li>
    </ul>
	<BackButton @click="closeAppointmentsList" />
  </div>
</template>

<script setup lang="ts">
import { useAppointmentStore } from '~/stores/useAppointmentStore'
import type { Appointment } from '~/types'
import { Popup } from 'vue-tg'
import { BackButton } from 'vue-tg'

const appointmentStore = useAppointmentStore()
const appointments = ref<Omit<Appointment, 'userId' | 'user'>[]>([])

onMounted(async () => {
  await fetchAppointments()
})

async function fetchAppointments() {
  appointments.value = await appointmentStore.fetchUserAppointments()
}

function formatDateTime(dateTime: string) {
  const date = new Date(dateTime)
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function removeAppointment(id: number) {
  await appointmentStore.removeAppointment(id)
  await fetchAppointments()
}

function rescheduleAppointment(appointment: Omit<Appointment, 'userId' | 'user'>) {
  appointmentStore.setReschedulingAppointment(appointment)
  appointmentStore.goBackToCalendar()
  closeAppointmentsList()
}

function closeAppointmentsList() {
  appointmentStore.hideAppointmentsList()
}
</script>

<style scoped>
.appointments-list {
  background-color: var(--tg-theme-bg-color, #ffffff);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: var(--tg-theme-text-color, #000000);
}

.no-appointments {
  color: var(--tg-theme-hint-color, #999999);
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid var(--tg-theme-hint-color, #cccccc);
}

.appointment-item:last-child {
  border-bottom: none;
}

.appointment-info {
  flex-grow: 1;
}

.date-time {
  font-weight: bold;
  margin-bottom: 5px;
}

.service {
  color: var(--tg-theme-hint-color, #666666);
}

.appointment-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.reschedule {
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
}

.remove {
  background-color: #ff4d4f;
  color: #ffffff;
}

.close-button {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
  color: var(--tg-theme-text-color, #000000);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>