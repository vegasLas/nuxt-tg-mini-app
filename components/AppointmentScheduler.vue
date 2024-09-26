<template>
  <div class="appointment-scheduler">
    <template v-if="currentStep === 'calendar'">
      <VCalendar
        :attributes="calendarAttributes"
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
import { ref, computed } from 'vue'
import type { OpenWindow, CalendarAttribute, SelectedDate, SelectedTime } from '~/types'
import UserInfoForm from './UserInfoForm.vue'
import AvailableTimeSlots from './AvailableTimeSlots.vue'

// Mock data for open windows (replace with actual data from your backend)
const openWindows: OpenWindow[] = [
  { date: new Date(2023, 4, 15), slots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'] },
  { date: new Date(2023, 4, 16), slots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'] },
  // Add more open windows as needed
]

const selectedDate = ref<SelectedDate>(null)
const selectedTime = ref<SelectedTime>(null)
const availableTimeSlots = ref<string[]>([])

const calendarAttributes = computed<CalendarAttribute[]>(() => {
  return openWindows.map(window => ({
    dot: 'green',
    dates: window.date,
    popover: {
      label: 'Open slots available'
    }
  }))
})

const currentStep = ref<'calendar' | 'timeSlots' | 'userInfo'>('calendar')

function onDayClick(day: { date: Date }): void {
  const openWindow = openWindows.find(window => 
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
  selectedTime.value = null
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