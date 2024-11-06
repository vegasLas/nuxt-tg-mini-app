export const useAvailableTimeSlots = defineStore('availableTimeSlots', () => {
  const calendarStore = useCalendarStore()
  const openWindowsStore = useOpenWindowsStore()
  const { openWindows } = storeToRefs(openWindowsStore)
  const selectedSlot = ref<{ time: Date, show: string, bookedAppointmentId: number | null } | null>(null)
  const isPast = computed(() => {
    return selectedSlot.value?.time && toMoscowTime(selectedSlot.value.time) <= toMoscowTime()
  })
  const availableTimeSlots = computed(() => {
    const selectedWindow = openWindows.value.find(window => 
      window.date.toDateString() === calendarStore.selectedDate?.toDateString()
    )
    if (selectedWindow) {
      return selectedWindow.slots.sort((a, b) => a.time.getTime() - b.time.getTime());
    }
    return [];
  })
  
  function selectTimeSlot(slot: { time: Date, show: string, bookedAppointmentId: number | null }): void {
    selectedSlot.value = slot
  }

  function resetSelectedSlot(): void {
    selectedSlot.value = null
  }

  return {
    isPast,
    availableTimeSlots,
    selectedSlot,
    selectTimeSlot,
    resetSelectedSlot,
  }
})
