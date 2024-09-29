import { ref } from 'vue'
import type { Appointment, SelectedDate, SelectedTime } from '~/types'
import { useWebApp } from 'vue-tg'
export const useAppointmentStore = defineStore('appointment', () => {
  const selectedDate = ref<SelectedDate>(null)
  const selectedTime = ref<SelectedTime>(null)
  const availableTimeSlots = ref<string[]>([])
  const currentStep = ref<'calendar' | 'timeSlots' | 'userInfo'>('calendar')
  const appointmentsCount = ref(0)

  async function fetchAppointmentsCount() {
    try {
      const response = await useFetch('/api/appointments', {
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      const appointments = response.data.value as Appointment[]
      appointmentsCount.value = appointments.length
    } catch (error) {
      console.error('Error fetching appointments count:', error)
    }
  }

  function onDayClick(day: { date: Date }, openWindows: { date: Date; slots: string[] }[]) {
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

  function proceedToUserInfo() {
    if (selectedDate.value && selectedTime.value) {
      currentStep.value = 'userInfo'
    }
  }

  function goBackToCalendar() {
    currentStep.value = 'calendar'
    selectedDate.value = null
    selectedTime.value = null
    availableTimeSlots.value = []
  }

  function goBackToTimeSlots() {
    currentStep.value = 'timeSlots'
  }

  function submitAppointment(userInfo: { username: string; phone: string }) {
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

  return {
    selectedDate,
    selectedTime,
    availableTimeSlots,
    currentStep,
    appointmentsCount,
    fetchAppointmentsCount,
    onDayClick,
    proceedToUserInfo,
    goBackToCalendar,
    goBackToTimeSlots,
    submitAppointment
  }
})