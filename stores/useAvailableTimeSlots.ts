import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCalendarStore } from '~/stores/useCalendarStore'
import { useAppointmentStore } from '~/stores/useAppointmentStore'
import { useUserStore } from '~/stores/useUserStore'

export const useAvailableTimeSlots = defineStore('availableTimeSlots', () => {
  const calendarStore = useCalendarStore()
  const appointmentStore = useAppointmentStore()
  const userStore = useUserStore()
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
    goBack,
    proceed
  }
})