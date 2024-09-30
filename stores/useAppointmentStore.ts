import type { Appointment, SelectedDate, SelectedTime } from '~/types'
import { useWebApp } from 'vue-tg'
export const useAppointmentStore = defineStore('appointment', () => {
  const selectedDate = ref<SelectedDate>(null)
  const selectedTime = ref<SelectedTime>(null)
  const availableTimeSlots = ref<string[]>([])
  const currentStep = ref<'calendar' | 'timeSlots' | 'userInfo' | 'appointmentsList'>('calendar')
  const appointmentsCount = ref(0)
  const reschedulingAppointment = ref(null)

  async function fetchUserAppointments() {
    try {
      const response = await useFetch('/api/appointments', {
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      if (!response.data.value) {
        throw new Error('Failed to fetch appointments')
      }
      const appointments = response.data.value as Appointment[]
      appointmentsCount.value = appointments.length
      return appointments
    } catch (error) {
      console.error('Error fetching user appointments:', error)
      return []
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
      selectedDate.value = null
      selectedTime.value = null
      availableTimeSlots.value = []
      currentStep.value = 'calendar'
    }
  }

  function showAppointmentsList() {
    currentStep.value = 'appointmentsList'
  }

  function hideAppointmentsList() {
    currentStep.value = 'calendar'
  }

  async function removeAppointment(id: number) {
    try {
      const response = await useFetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })
      if (!response.data.value) {
        throw new Error('Failed to remove appointment')
      }
      await fetchUserAppointments()
    } catch (error) {
      console.error('Error removing appointment:', error)
    }
  }

  function setReschedulingAppointment(appointment: any) {
    reschedulingAppointment.value = appointment
  }

  return {
    selectedDate,
    selectedTime,
    availableTimeSlots,
    currentStep,
    appointmentsCount,
    fetchUserAppointments,
    onDayClick,
    proceedToUserInfo,
    goBackToCalendar,
    goBackToTimeSlots,
    submitAppointment,
    showAppointmentsList,
    hideAppointmentsList,
    removeAppointment,
    setReschedulingAppointment
  }
})