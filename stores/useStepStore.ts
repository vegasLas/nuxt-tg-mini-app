import { startOfDay } from 'date-fns'

export const useStepStore = defineStore('step', () => {
  const currentStep = ref<'calendar' | 'adminAppointmentsOverview' | 'adminAppointmentsList' | 'timeSlots' | 'userInfo' | 'appointmentsList'>('calendar')
  const calendarStore = useCalendarStore()
  function proceedToUserInfo() {
    currentStep.value = 'userInfo'
  }

  function goToCalendar() {
    calendarStore.currentMonth = startOfDay(toMoscowTime())
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

  function showAdminAppointmentsOverview() {
    currentStep.value = 'adminAppointmentsOverview'
  }

  return {
    currentStep,
    proceedToUserInfo,
    goToCalendar,
    goToTimeSlots,
    showAppointmentsList,
    showAdminAppointmentsList,
    showAdminAppointmentsOverview,
  }
})
