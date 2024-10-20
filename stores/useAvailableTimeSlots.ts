import { useWebAppPopup } from 'vue-tg'
import { parseISO } from 'date-fns'
export const useAvailableTimeSlots = defineStore('availableTimeSlots', () => {
  const calendarStore = useCalendarStore()
  const userStore = useUserStore()
  const stepStore = useStepStore()
  const { isCanceling } = storeToRefs(userStore)
  const bookedAppointmentsStore = useBookedAppointmentsStore()
  const { openWindows } = storeToRefs(bookedAppointmentsStore)
  const selectedSlot = ref<{ time: Date, show: string, bookedAppointmentId: number | null } | null>(null)

  const cancelMode = ref(false)
  const isRescheduling = ref(false)
  const adminStore = useAdminStore()

  const availableTimeSlots = computed(() => {
    const selectedWindow = openWindows.value.find(window => 
      window.date.toDateString() === calendarStore.selectedDate?.toDateString()
    )
    if (selectedWindow) {
      return selectedWindow.slots.sort((a, b) => {
        return a.time.getTime() - b.time.getTime();
      });
    }
    return [];
  })

  const hasExistingAppointment = computed(() => 
    userStore.hasAppointmentOnDate(calendarStore.selectedDate)
  )

  const isLoading = computed(() => 
    isCanceling.value || isRescheduling.value
  )

  const getMainButtonText = computed(() => {
    if (adminStore.isAdmin && selectedSlot.value?.bookedAppointmentId) {
      return 'Отменить запись'
    }
    return cancelMode.value ? 'Отменить запись' : 'Продолжить'
  })
  
  function selectTimeSlot(slot: { time: Date, show: string, bookedAppointmentId: number | null }): void {
    if (userStore.hasAppointment(slot.time) || (adminStore.isAdmin && slot.bookedAppointmentId)) {
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
  function resetSelectedSlotAndMode(): void {
    selectedSlot.value = null
    cancelMode.value = false
  }
  async function cancelAppointment(): Promise<void> {
    const isCanceled = await userStore.handleCancelAppointment(selectedSlot.value?.bookedAppointmentId!)
    if (isCanceled) {
      resetSelectedSlotAndMode()
    }
  }

  async function handleMainButtonClick() {
    if (adminStore.isAdmin && selectedSlot.value?.bookedAppointmentId) {
      const isCanceled = await adminStore.handleCancelAppointment(selectedSlot.value?.bookedAppointmentId!)
      if (isCanceled) {
        resetSelectedSlotAndMode()
      }
    } else if (!adminStore.isAdmin && hasExistingAppointment.value) {
      showAppointmentOptionsPopup()
    } else {
      if (!adminStore.isAdmin) {
        const activeAppointments = userStore.appointments.filter(appointment => 
          parseISO(appointment.time) > new Date()
        )
  
        if (activeAppointments.length >= 2 && !adminStore.isAdmin) {
          showNotification({
            type: 'error',
            message: 'У вас уже есть 2 активных записи. Пожалуйста, отмените одну из них, прежде чем создавать новую.',
            time: 3
          })
          return
        }
      }
      proceed()
    }
  }

  function showAppointmentOptionsPopup() {
    const { showPopup, onPopupClosed } = useWebAppPopup()
    showPopup({
      title: 'У вас уже есть запись',
      message: 'Вы хотите перенести существующую запись или создать новую?',
      buttons: [
        {
          id: 'reschedule',
          type: 'default',
          text: 'Перенести запись'
        },
        {
          id: 'createNew',
          type: 'default',
          text: 'Создать новую'
        },
        {
          text: 'Закрыть',
          type: 'destructive',
        },
      ],
    })

    const popupClosed = onPopupClosed(async (e: { button_id: string }) => {
      if (e.button_id === 'reschedule') {
        rescheduleAppointment()
      } else if (e.button_id === 'createNew') {
        const activeAppointments = userStore.appointments.filter(appointment => 
          parseISO(appointment.time) > new Date()
        )
        if (!adminStore.isAdmin && activeAppointments.length >= 2) {
          showNotification({
            type: 'error',
            message: 'У вас уже есть 2 активных записи. Пожалуйста, отмените одну из них, прежде чем создавать новую.',
            time: 3
          })
          return
        }
        proceed()

      }
      popupClosed.off()
    }, { manual: true })
  }

  const rescheduleAppointment = async () => {
    if (!selectedSlot.value) return
    const oldAppointment = userStore.appointments.find(appointment => 
      new Date(appointment.time).toDateString() === calendarStore.selectedDate?.toDateString()
    )

    if (!oldAppointment) return
    isRescheduling.value = true
    try {
      await userStore.rescheduleUserAppointment(oldAppointment, selectedSlot.value.time)
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
    } finally {
      isRescheduling.value = false
    }
  }
  return {
    availableTimeSlots,
    selectedSlot,
    cancelMode,
    isCanceling,
    isRescheduling,
    hasExistingAppointment,
    isLoading,
    getMainButtonText,
    cancelAppointment,
    selectTimeSlot,
    closeTimeSlots,
    proceed,
    rescheduleAppointment,
    handleMainButtonClick,
    showAppointmentOptionsPopup
  }
})
