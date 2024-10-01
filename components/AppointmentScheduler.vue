<template>
  <div class="appointment-scheduler">
    <div class="appointments-count">
      <button class="count-button" @click="showAppointmentsDetails">
        <span class="label">Мои записи</span>
        <span class="count">{{ appointmentStore.appointments.length }}</span>
      </button>
    </div>

    <template v-if="appointmentStore.currentStep === 'calendar'">
      <div class="calendar-container">
        <VCalendar
          size="large"
          locale="ru-RU"
          :attributes="calendarStore.calendarAttributes"
          :disabled-dates="[
            {
              repeat: {
                weekdays: [1, 7],
              },
            },
          ]"
          @dayclick="(day: any) => appointmentStore.onDayClick(day, calendarStore.openWindows)"
        />
      </div>
      <div class="legend">
        <div><span class="dot green"></span> Есть свободные окна</div>
        <div><span class="dot red"></span> Все окна заняты</div>
      </div>
    </template>

    <template v-else-if="appointmentStore.currentStep === 'timeSlots'">
      <AvailableTimeSlots
        :availableTimeSlots="appointmentStore.availableTimeSlots"
        v-model:selectedTime="appointmentStore.selectedTime"
        @back="appointmentStore.goBackToCalendar"
        @proceed="appointmentStore.proceedToUserInfo"
      />
    </template>
    
    <template v-else-if="appointmentStore.currentStep === 'userInfo'">
      <UserInfoForm @submit="appointmentStore.submitAppointment" @back="appointmentStore.goBackToTimeSlots" />
    </template>

    <template v-else-if="appointmentStore.currentStep === 'appointmentsList'">
      <AppointmentsList />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import UserInfoForm from './UserInfoForm.vue'
import AvailableTimeSlots from './AvailableTimeSlots.vue'
import AppointmentsList from './AppointmentsList.vue'
import { useCalendarStore } from '~/stores/useCalendarStore'
import { useAppointmentStore } from '~/stores/useAppointmentStore'

const calendarStore = useCalendarStore()
const appointmentStore = useAppointmentStore()

function showAppointmentsDetails() {
  appointmentStore.showAppointmentsList()
}

onMounted(() => {
  calendarStore.fetchOpenWindows()
  appointmentStore.fetchUserAppointments()
})
</script>

<style scoped>
.appointment-scheduler {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--tg-theme-bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 80vh; /* Ensure the component takes the full height of the viewport */
}

.calendar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-grow: 1; /* Allow the container to grow and take available space */
}

.legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 16px;
}

.dot {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.dot.green {
  background-color: green;
}

.dot.red {
  background-color: red;
}

@media (max-width: 600px) {
  .appointment-scheduler {
    padding: 16px;
    gap: 16px;
  }
}

.appointments-count {
  width: 100%;
  display: flex;
  justify-content: right;
  margin-bottom: 10px;
  margin-right: 10px;
}

.count-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.count-button:hover {
  background-color: var(--tg-theme-button-color, #2d7fcf);
}

.count {
  font-size: 24px;
  font-weight: bold;
}

.label {
  font-size: 14px;
  margin-top: 4px;
}

/* ... existing styles ... */
</style>