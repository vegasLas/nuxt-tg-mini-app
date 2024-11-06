import { useWebAppPopup } from 'vue-tg'
import { parseISO } from 'date-fns'

export const useAppointmentActionsStore = defineStore('appointmentActions', () => {
  const userStore = useUserStore()
  const stepStore = useStepStore()
  const appointmentStore = useAppointmentStore()
  const calendarStore = useCalendarStore()
  const adminStore = useAdminStore()
  const availableTimeSlotsStore = useAvailableTimeSlots()

  const isRescheduling = ref(false)

  const hasExistingAppointment = computed(() => 
    userStore.hasAppointment(availableTimeSlotsStore.selectedSlot?.bookedAppointmentId!)
  )

  const isLoading = computed(() => {
    return appointmentStore.isCanceling || isRescheduling.value
  })

  const getMainButtonText = computed(() => {
    if (adminStore.isAdmin && availableTimeSlotsStore.selectedSlot?.bookedAppointmentId) {
      return 'Отменить запись'
    }
    return availableTimeSlotsStore.selectedSlot?.bookedAppointmentId ? 'Отменить запись' : 'Продолжить'
  })

  function closeTimeSlots(): void {
    calendarStore.setSelectedDate(null)
    availableTimeSlotsStore.resetSelectedSlot()
    stepStore.goToCalendar()
  }

  function proceed(): void {
    stepStore.proceedToUserInfo()
  }

  function resetModes(): void {
    isRescheduling.value = false
  }

  async function cancelAppointment(): Promise<void> {
    const isCanceled = await userStore.handleCancelAppointment(availableTimeSlotsStore.selectedSlot?.bookedAppointmentId!)
    if (isCanceled) {
      availableTimeSlotsStore.resetSelectedSlot()
      resetModes()
    }
  }

  async function handleMainButtonClick() {
    const { bookedAppointmentId, time } = availableTimeSlotsStore.selectedSlot || {};
    
    if (adminStore.isAdmin && bookedAppointmentId) {
      const isCanceled = await adminStore.handleCancelAppointment(bookedAppointmentId);
      if (isCanceled) {
        availableTimeSlotsStore.resetSelectedSlot()
        resetModes()
      }
      return;
    }

    if (availableTimeSlotsStore.selectedSlot && hasExistingAppointment.value) {
      await cancelAppointment()
      return
    }

    const activeAppointments = userStore.appointments.filter(appointment => 
      parseISO(appointment.time) > toMoscowTime()
    );

    if (adminStore.isAdmin) {
      proceed()
      return
    }
    if (activeAppointments.length < 2 && userStore.hasAppointmentOnDate(calendarStore.selectedDate!)) {
      showAppointmentOptionsPopup()
      return
    }
    if (activeAppointments.length >= 2) {
      showNotification({
        type: 'error',
        message: 'У вас уже есть 2 активных записи. Пожалуйста, отмените одну из них, прежде чем создавать новую.',
        time: 3
      });
      return;
    }

    proceed();
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
        await rescheduleAppointment()
        availableTimeSlotsStore.resetSelectedSlot()
        resetModes()
      } else if (e.button_id === 'createNew') {
        const activeAppointments = userStore.appointments.filter(appointment => 
          parseISO(appointment.time) > toMoscowTime()
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
    if (!availableTimeSlotsStore.selectedSlot) return
    const oldAppointment = userStore.appointments.find(appointment => {
      const appointmentDate = toMoscowTime(appointment.time);
      return appointmentDate.toDateString() === availableTimeSlotsStore.selectedSlot?.time.toDateString();
    });

    if (!oldAppointment) return
    isRescheduling.value = true
    try {
      await userStore.rescheduleUserAppointment(oldAppointment, availableTimeSlotsStore.selectedSlot.time)
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
    } finally {
      isRescheduling.value = false
    }
  }

  return {
    isRescheduling,
    hasExistingAppointment,
    isLoading,
    getMainButtonText,
    cancelAppointment,
    closeTimeSlots,
    proceed,
    rescheduleAppointment,
    handleMainButtonClick,
    showAppointmentOptionsPopup
  }
})
