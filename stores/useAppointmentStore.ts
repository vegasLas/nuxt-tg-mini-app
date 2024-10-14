export const useAppointmentStore = defineStore('appointment', () => {
  const selectedDate = ref<Date | null>(null)
  const selectedTime = ref<Date | null>(null)
  const availableTimeSlots = ref<{ show: string; time: Date }[]>([])
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


  function hideAppointmentsList() {
    selectedDate.value = null
    selectedTime.value = null
    availableTimeSlots.value = []
    stepStore.goToTimeSlots()
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
    hideAppointmentsList,
    setSelectedDate,
    setSelectedTime
  }
})