export const useStepStore = defineStore('step', () => {
  const currentStep = ref<'calendar' | 'adminAppointmentsList' | 'timeSlots' | 'userInfo' | 'appointmentsList'>('calendar')

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

  function showAdminAppointmentsList() {
    currentStep.value = 'adminAppointmentsList'
  }

  return {
    currentStep,
    proceedToUserInfo,
    goToCalendar,
    goToTimeSlots,
    showAppointmentsList,
    showAdminAppointmentsList,
  }
})