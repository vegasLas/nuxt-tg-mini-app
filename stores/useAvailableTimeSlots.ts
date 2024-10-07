import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCalendarStore } from '~/stores/useCalendarStore'
import { useAppointmentStore } from '~/stores/useAppointmentStore'
import { useUserStore } from '~/stores/useUserStore'
import { useWebAppPopup } from 'vue-tg'
import notie from 'notie'

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

  async function handleCancel(): Promise<void> {
    const { showPopup, onPopupClosed } = useWebAppPopup()
    const popupClosed = onPopupClosed(async (e: { button_id: string }) => {
      if (e.button_id !== 'removeAppointment') return
      
      try {
        await userStore.removeAppointment(selectedTime.value!)
        notie.alert({
          type: 'success',
          text: 'Запись успешно отменена',
          time: 2,
          position:  'bottom'
        })
        unselectTimeSlot()
        cancelMode.value = false
      } catch (error) { 
        notie.alert({
          type: 'error',
          text: 'Ошибка при отмене записи',
          time: 2,
          position: 'bottom'
        })
        console.error('Error removing appointment:', error)
      }
      finally {
        popupClosed.off()
      }
    }, { manual: true })
    showPopup({
      title: 'Отмена записи',
      message: 'Хотите отменить запись?',
      buttons: [
        {
          text: 'Закрыть',
          type: 'destructive',
        },
        {
          id: 'removeAppointment',
          type: 'default',
          text: 'Отменить запись'
        },
      ],
    })
  }

  return {
    availableTimeSlots,
    selectedTime,
    selectedDate,
    cancelMode,
    isRemoving,
    selectTimeSlot,
    unselectTimeSlot,
    goBack,
    proceed,
    handleCancel
  }
})