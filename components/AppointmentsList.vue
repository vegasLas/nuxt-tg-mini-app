<template>
  <div class="appointments-list">
    <h2 style="color: #000000;">Мои записи</h2>
    <div v-if="userStore.appointments.length === 0" class="no-appointments">
      У вас нет запланированных записей.
    </div>
    <ul v-else>
      <li v-for="appointment in userStore.appointments" :key="appointment.id" class="appointment-item">
        <div class="appointment-info">
          <div class="date-time">
            {{ formatDateTime(new Date(appointment.time).toISOString()) }}
          </div>
        </div>
        <div class="appointment-actions">
          <button @click="rescheduleAppointment(appointment)" class="action-button reschedule">
            Перенести
          </button>
          <button @click="() => handleCancel(appointment)" class="action-button remove">
            Отменить
          </button>
        </div>
      </li>
    </ul>
    <BackButton @click="closeAppointmentsList" />
  </div>
</template>

<script setup lang="ts">
import { useAppointmentStore } from '~/stores/useAppointmentStore'
import { useUserStore } from '~/stores/useUserStore'
import type { Appointment } from '~/types'
import { BackButton } from 'vue-tg'
import { useWebAppPopup } from 'vue-tg'

const appointmentStore = useAppointmentStore()
const userStore = useUserStore()

function rescheduleAppointment(appointment: Omit<Appointment, 'userId' | 'user'>) {
  appointmentStore.setReschedulingAppointment(appointment)
  appointmentStore.goBackToCalendar()
  closeAppointmentsList()
}

function closeAppointmentsList() {
  appointmentStore.hideAppointmentsList()
}

const handleCancel = (appointment: Omit<Appointment, 'userId' | 'user'>) => {
  const { showPopup, onPopupClosed } = useWebAppPopup()
  onPopupClosed((e: { button_id: string }) => {
    if (e.button_id === 'removeAppointment') {
      userStore.removeAppointment(appointment.time)
    }
  }, {
    manual: true
  })
  showPopup({
    title: 'Отмена записи',
    message: 'Вы уверены, что хотите отменить эту запись?',
    buttons: [
      {
        text: 'Закрыть',
        type: 'destructive',
      },
      {
        id: 'removeAppointment',
        type: 'default',
        text: 'Отменить запись'
      },
    ],
  })
}
</script>

<style scoped>
.appointments-list {
  height: 70vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 10px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 10px;
  color: var(--tg-theme-text-color, #000000);
}

.no-appointments {
  color: var(--tg-theme-hint-color, #999999);
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
  background-color: #ffffff;
  border-radius: 8px;
  overflow-y: auto; /* Enable vertical scrolling */
  flex-grow: 1; /* Allow the ul to grow and take available space */
  margin-bottom: 10px; /* Add some space before the BackButton */
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #cccccc);
  color: #000000;
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
  color: #000000;
}

.service {
  color: #666666;
}

.appointment-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.action-button {
  padding: 4px 8px;
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

/* BackButton styles */
:deep(.back-button) {
  margin-top: auto; /* Push the BackButton to the bottom */
}
</style>