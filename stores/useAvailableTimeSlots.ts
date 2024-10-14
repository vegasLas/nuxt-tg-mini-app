import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

export const useAvailableTimeSlots = defineStore('availableTimeSlots', () => {
  const calendarStore = useCalendarStore()
  const appointmentStore = useAppointmentStore()
  const userStore = useUserStore()
  const stepStore = useStepStore()
  const {isRemoving} = storeToRefs(userStore)

  const { openWindows } = storeToRefs(calendarStore)
  const { selectedDate, selectedTime } = storeToRefs(appointmentStore)

  const cancelMode = ref(false)

  const availableTimeSlots = computed(() => {
    const selectedWindow = openWindows.value.find(window => 
      window.date.toDateString() === selectedDate.value?.toDateString()
    )
    return selectedWindow ? selectedWindow.slots : []
  })

  function selectTimeSlot(slot: { time: Date, show: string }): void {
    if (userStore.hasAppointment(slot.time)) {
      appointmentStore.setSelectedTime(slot.time)
      cancelMode.value = true
    } else {
      appointmentStore.setSelectedTime(slot.time)
      cancelMode.value = false
    }
  }

  function closeForm(): void {
    appointmentStore.setSelectedDate(null)
    appointmentStore.setSelectedTime(null)
    stepStore.goToCalendar()
  }

  function unselectTimeSlot(): void {
    appointmentStore.setSelectedTime(null)
  }

  function proceed(): void {
    stepStore.proceedToUserInfo()
  }

  async function cancelAppointment(): Promise<void> {
    const isCanceled = await userStore.handleCancel(selectedTime.value?.toString()!)
    if (isCanceled) {
      unselectTimeSlot()
      cancelMode.value = false
    }
  }

  return {
    availableTimeSlots,
    selectedTime,
    selectedDate,
    cancelMode,
    isRemoving,
    cancelAppointment,
    selectTimeSlot,
    unselectTimeSlot,
    closeForm,
    proceed
  }
})