import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCalendarStore } from '~/stores/useCalendarStore'
import { useAppointmentStore } from '~/stores/useAppointmentStore'

export const useAvailableTimeSlots = defineStore('availableTimeSlots', () => {
  const calendarStore = useCalendarStore()
  const appointmentStore = useAppointmentStore()

  const { openWindows } = storeToRefs(calendarStore)
  const { selectedDate, selectedTime } = storeToRefs(appointmentStore)

  const availableTimeSlots = computed(() => {
    const selectedWindow = openWindows.value.find(window => 
      window.date.toDateString() === selectedDate.value?.toDateString()
    )
    return selectedWindow ? selectedWindow.slots : []
  })

  function selectTimeSlot(slot: { show: string; time: Date }): void {
    appointmentStore.setSelectedTime(slot.time)
  }

  function goBack(): void {
    appointmentStore.setSelectedDate(null)
    appointmentStore.setSelectedTime(null)
    appointmentStore.goBackToCalendar()
  }
  function unselectTimeSlot(): void {
    appointmentStore.setSelectedTime(null)
  }
  function proceed(): void {
    appointmentStore.currentStep = 'userInfo'
  }

  return {
    availableTimeSlots,
    selectedTime,
    selectedDate,
    selectTimeSlot,
    unselectTimeSlot,
    goBack,
    proceed
  }
})