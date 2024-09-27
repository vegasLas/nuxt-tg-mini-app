<template>
  <div class="appointment-scheduler">
    <template v-if="currentStep === 'calendar'">
      <div class="calendar-container">
        <VCalendar
          size="large"
          locale="ru-RU"
          :attributes="calendarAttributes"
          :disabled-dates="[
            {
              repeat: {
                weekdays: [1, 7],
              },
            },
          ]"
          @dayclick="onDayClick"
        />
      </div>
      <div class="legend">
        <div><span class="dot green"></span> Есть свободные окна</div>
        <div><span class="dot red"></span> Все окна заняты</div>
      </div>
    </template>

    <template v-else-if="currentStep === 'timeSlots'">
      <AvailableTimeSlots
        :availableTimeSlots="availableTimeSlots"
        v-model:selectedTime="selectedTime"
        @back="goBackToCalendar"
        @proceed="proceedToUserInfo"
      />
    </template>
    
    <template v-else-if="currentStep === 'userInfo'">
      <UserInfoForm @submit="submitAppointment" @back="goBackToTimeSlots" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CalendarAttribute, SelectedDate, SelectedTime } from '~/types'
import UserInfoForm from './UserInfoForm.vue'
import AvailableTimeSlots from './AvailableTimeSlots.vue'
import type { Appointment } from '~/types'

const selectedDate = ref<SelectedDate>(null)
const selectedTime = ref<SelectedTime>(null)
const availableTimeSlots = ref<string[]>([])
const openWindows = ref<{ date: Date, slots: string[] }[]>([])

const calendarAttributes = computed<CalendarAttribute[]>(() => {
  return openWindows.value.map(window => ({
    dot: window.slots.length > 0 ? 'green' : 'red',
    dates: window.date,
    popover: {
      label: window.slots.length > 0 ? 'Есть свободные окна' : 'Все окна заняты'
    }
  }))
})

const currentStep = ref<'calendar' | 'timeSlots' | 'userInfo'>('calendar')

async function fetchOpenWindows() {
  try {
    const response = await fetch('/api/appointments')
    const appointments = await response.json() as Appointment[]

    const workDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const workHours = Array.from({ length: 9 }, (_, i) => `${9 + i}:00`)

    const openWindowsMap: { [key: string]: { date: Date, slots: string[] } } = {}

    // Define a range of dates to consider (e.g., the next 30 days)
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + 30)

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.toLocaleDateString('en-US', { weekday: 'short' })
      if (workDays.includes(day)) {
        const dateString = d.toDateString()
        openWindowsMap[dateString] = { date: new Date(d), slots: [...workHours] }
      }
    }

    if (appointments.length > 0) {
      appointments.forEach((appointment) => {
        const date = new Date(appointment.time)
        const dateString = date.toDateString()
        const appointmentTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

        if (openWindowsMap[dateString]) {
          const appointmentTimeIndex = openWindowsMap[dateString].slots.indexOf(appointmentTime)
          if (appointmentTimeIndex !== -1) {
            openWindowsMap[dateString].slots.splice(appointmentTimeIndex, 1)
          }
        }
      })
    }

    openWindows.value = Object.values(openWindowsMap)
  } catch (error) {
    console.error('Error fetching open windows:', error)
  }
}

function onDayClick(day: { date: Date }): void {
  const openWindow = openWindows.value.find(window => 
    window.date.toDateString() === day.date.toDateString()
  )
  
  if (openWindow) {
    selectedDate.value = day.date.toLocaleDateString()
    availableTimeSlots.value = openWindow.slots
    selectedTime.value = null
    currentStep.value = 'timeSlots'
  } else {
    selectedDate.value = null
    availableTimeSlots.value = []
  }
}

function proceedToUserInfo(): void {
  if (selectedDate.value && selectedTime.value) {
    currentStep.value = 'userInfo'
  }
}

function goBackToCalendar(): void {
  currentStep.value = 'calendar'
  selectedDate.value = null
  selectedTime.value = null
  availableTimeSlots.value = []
}

function goBackToTimeSlots(): void {
  currentStep.value = 'timeSlots'
}

function submitAppointment(userInfo: { username: string, phone: string }): void {
  if (selectedDate.value && selectedTime.value) {
    // Implement booking logic here
    console.log('Booking appointment for', selectedDate.value, 'at', selectedTime.value)
    console.log('User Info:', userInfo)
    // Reset selection after booking
    selectedDate.value = null
    selectedTime.value = null
    availableTimeSlots.value = []
    currentStep.value = 'calendar'
  }
}

onMounted(() => {
  fetchOpenWindows()
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
</style>