<template>
  <div class="appointment-scheduler">
    <template v-if="currentStep === 'calendar'">
      <VCalendar
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
    dot: 'green',
    dates: window.date,
    popover: {
      label: 'Open slots available'
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
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}
</style>