import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

export const useAvailableTimeSlots = defineStore('availableTimeSlots', () => {
  const calendarStore = useCalendarStore()
  const userStore = useUserStore()
  const stepStore = useStepStore()
  const { isCanceling } = storeToRefs(userStore)

  const { openWindows } = storeToRefs(calendarStore)
  const selectedTime = ref<Date | null>(null)

  const cancelMode = ref(false)

  const availableTimeSlots = computed(() => {
    const selectedWindow = openWindows.value.find(window => 
      window.date.toDateString() === calendarStore.selectedDate?.toDateString()
    )
    return selectedWindow ? selectedWindow.slots : []
  })

  function selectTimeSlot(slot: { time: Date, show: string }): void {
    if (userStore.hasAppointment(slot.time)) {
      selectedTime.value = slot.time
      cancelMode.value = true
    } else {
      selectedTime.value = slot.time
      cancelMode.value = false
    }
  }

  function closeTimeSlots(): void {
    calendarStore.setSelectedDate(null)
    selectedTime.value = null
    stepStore.goToCalendar()
  }

  function unselectTimeSlot(): void {
    selectedTime.value = null
  }

  function proceed(): void {
    stepStore.proceedToUserInfo()
  }

  async function cancelAppointment(): Promise<void> {
    const isCanceled = await userStore.handleCancelAppointment(selectedTime.value?.toString()!)
    if (isCanceled) {
      unselectTimeSlot()
      cancelMode.value = false
    }
  }

  return {
    availableTimeSlots,
    selectedTime,
    cancelMode,
    isCanceling,
    cancelAppointment,
    selectTimeSlot,
    unselectTimeSlot,
    closeTimeSlots,
    proceed
  }
})