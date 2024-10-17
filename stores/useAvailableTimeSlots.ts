import { computed, ref } from 'vue'

export const useAvailableTimeSlots = defineStore('availableTimeSlots', () => {
  const calendarStore = useCalendarStore()
  const userStore = useUserStore()
  const stepStore = useStepStore()
  const { isCanceling } = storeToRefs(userStore)

  const { openWindows } = storeToRefs(calendarStore)
  const selectedSlot = ref<{ time: Date, show: string, booked: boolean } | null>(null)

  const cancelMode = ref(false)

  const availableTimeSlots = computed(() => {
    const selectedWindow = openWindows.value.find(window => 
      window.date.toDateString() === calendarStore.selectedDate?.toDateString()
    )
    console.log('selectedWindow', selectedWindow?.slots)
    return selectedWindow ? selectedWindow.slots : []
  })

  function selectTimeSlot(slot: { time: Date, show: string, booked: boolean }): void {
    if (userStore.hasAppointment(slot.time)) {
      selectedSlot.value = slot
      cancelMode.value = true
    } else {
      selectedSlot.value = slot
      cancelMode.value = false
    }
  }

  function closeTimeSlots(): void {
    calendarStore.setSelectedDate(null)
    selectedSlot.value = null
    stepStore.goToCalendar()
  }

  function proceed(): void {
    stepStore.proceedToUserInfo()
  }

  async function cancelAppointment(): Promise<void> {
    const isCanceled = await userStore.handleCancelAppointment(selectedSlot.value?.time?.toString()!)
    if (isCanceled) {
      selectedSlot.value = null

      cancelMode.value = false
    }
  }

  return {
    availableTimeSlots,
    selectedSlot,
    cancelMode,
    isCanceling,
    cancelAppointment,
    selectTimeSlot,
    closeTimeSlots,
    proceed
  }
})