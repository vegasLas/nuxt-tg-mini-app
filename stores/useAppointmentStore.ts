export const useAppointmentStore = defineStore('appointment', () => {
  const selectedDate = ref<Date | null>(null)
  const selectedTime = ref<Date | null>(null)
  const availableTimeSlots = ref<{ show: string; time: Date }[]>([])
  const currentStep = ref<'calendar' | 'timeSlots' | 'userInfo' | 'appointmentsList'>('calendar')
  const reschedulingAppointment = ref(null)
  

  function onDayClick(day: { date: Date }, openWindows: { date: Date; slots: { show: string; time: Date }[] }[]) {
    try {
      const openWindow = openWindows.find(window => 
        window.date.toDateString() === day.date.toDateString()
      )
      
      if (openWindow) {
        selectedDate.value = day.date
        availableTimeSlots.value = openWindow.slots
        selectedTime.value = null
        currentStep.value = 'timeSlots'
      } else {
        selectedDate.value = null
        availableTimeSlots.value = []
      }
    } catch (error) {
      console.error('Error finding open window:', error)
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

  function submitAppointment() {
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

  function setReschedulingAppointment(appointment: any) {
    reschedulingAppointment.value = appointment
  }

  function setSelectedDate(date: Date | null) {
    selectedDate.value = date
  }

  function setSelectedTime(time: Date | null) {
    selectedTime.value = time
  }

  return {
    selectedDate,
    selectedTime,
    availableTimeSlots,
    currentStep,
    onDayClick,
    proceedToUserInfo,
    goBackToCalendar,
    goBackToTimeSlots,
    submitAppointment,
    showAppointmentsList,
    hideAppointmentsList,
    setReschedulingAppointment,
    setSelectedDate,
    setSelectedTime
  }
})