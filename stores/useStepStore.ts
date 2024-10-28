export const useStepStore = defineStore('step', () => {
  const currentStep = ref<'calendar' | 'adminAppointmentsList' | 'adminAppointmentsListAll' | 'timeSlots' | 'userInfo' | 'appointmentsList'>('calendar')

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

  function showAdminAppointmentsListAll() {
    currentStep.value = 'adminAppointmentsListAll'
  }

  return {
    currentStep,
    proceedToUserInfo,
    goToCalendar,
    goToTimeSlots,
    showAppointmentsList,
    showAdminAppointmentsList,
    showAdminAppointmentsListAll,
  }
})
