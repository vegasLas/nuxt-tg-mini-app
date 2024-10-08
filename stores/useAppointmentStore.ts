export const useAppointmentStore = defineStore('appointment', () => {
  const selectedDate = ref<Date | null>(null)
  const selectedTime = ref<Date | null>(null)
  const availableTimeSlots = ref<{ show: string; time: Date }[]>([])
  const reschedulingAppointment = ref(null)
  const stepStore = useStepStore()
  function onDayClick(day: { date: Date }, openWindows: { date: Date; slots: { show: string; time: Date }[] }[]) {
    try {
      const openWindow = openWindows.find(window => 
        window.date.toDateString() === day.date.toDateString()
      )
      
      if (openWindow) {
        selectedDate.value = day.date
        availableTimeSlots.value = openWindow.slots
        selectedTime.value = null
      } else {
        selectedDate.value = null
        availableTimeSlots.value = []
      }
    } catch (error) {
      console.error('Error finding open window:', error)
    }
  }

  function submitAppointment() {
    if (selectedDate.value && selectedTime.value) {
      selectedDate.value = null
      selectedTime.value = null
      availableTimeSlots.value = []
    }
  }

  function hideAppointmentsList() {
    selectedDate.value = null
    selectedTime.value = null
    availableTimeSlots.value = []
    stepStore.goToTimeSlots()
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
    onDayClick,
    submitAppointment,
    setReschedulingAppointment,
    setSelectedDate,
    setSelectedTime
  }
})