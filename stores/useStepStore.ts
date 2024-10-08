export const useStepStore = defineStore('step', () => {
  const currentStep = ref<'calendar' | 'timeSlots' | 'userInfo' | 'appointmentsList'>('calendar')

  function proceedToUserInfo() {
    currentStep.value = 'userInfo'
  }

  function goToCalendar() {
    currentStep.value = 'calendar'
  }

  function goToTimeSlots() {
    currentStep.value = 'timeSlots'
  }

  function showAppointmentsList() {
    currentStep.value = 'appointmentsList'
  }

  function hideAppointmentsList() {
    currentStep.value = 'calendar'
  }

  return {
    currentStep,
    proceedToUserInfo,
    goToCalendar,
    goToTimeSlots,
    showAppointmentsList,
    hideAppointmentsList,
  }
})