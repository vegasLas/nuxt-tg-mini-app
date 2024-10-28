import { useWebApp, useWebAppPopup } from 'vue-tg'
import { isSameHour, isSameDay, parseISO, startOfDay, endOfDay, isToday } from 'date-fns'
import { cancelAppointment } from '~/api/appointments'

interface Appointment {
  id: number
  time: string
  booked: boolean
  name: string
  comment: string | null
  phoneNumber: string
  userId: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  nextLink: string | null
}

interface AppointmentCounts {
  totalCount: number;
  todayCount: number;
  dates: {
    startDate: string;
    endDate: string;
  };
}

interface DateRangeResponse {
  appointments: Appointment[];
  pagination: PaginationInfo;
}

export const useAdminStore = defineStore('admin', () => {
  const disabledDaysStore = useDisabledTimeStore()
  const availableStore = useAvailableTimeSlots()
  const bookedAppointmentsStore = useBookedAppointmentsStore()
  const { disabledDays, disabledDayDates } = storeToRefs(disabledDaysStore)
  const appointments = ref<Appointment[]>([])
  const paginationInfo = ref<PaginationInfo | null>(null)
  const error = ref<string | null>(null)
  const isAdmin = ref(false)
  const appointmentCounts = ref<AppointmentCounts | null>(null)
  const currentDate = ref(new Date())
  const isLoading = ref(false)
  const isCanceling = ref(false)
  const filteredAppointments = computed(() => {
    const start = startOfDay(currentDate.value);
    const end = endOfDay(currentDate.value);
    return appointments.value
      .filter(appointment => {
        const appointmentDate = parseISO(appointment.time);
        return appointmentDate >= start && appointmentDate <= end;
      })
      .sort((a, b) => parseISO(a.time).getTime() - parseISO(b.time).getTime());
  });
  function addAppointmentToList(appointment: Appointment) {
    appointments.value.unshift(appointment)
    if (isToday(parseISO(appointment.time)) && appointmentCounts.value) {
        appointmentCounts.value.todayCount += 1;
    }
    if (appointmentCounts.value) {
      appointmentCounts.value.totalCount += 1;
    }
  }
  async function fetchAppointmentsByDate(date: Date) {
    const isAlreadyFetched = appointments.value.some(appointment => isSameDay(appointment.time, date))
    if (isAlreadyFetched) return
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    // Check if there are already appointments in the range of the given date
    const existingAppointments = appointments.value.filter(appointment => {
      const appointmentDate = parseISO(appointment.time);
      return appointmentDate >= start && appointmentDate <= end;
    });

    // If appointments already exist for the date range, do not fetch
    if (existingAppointments.length > 0) {
      return; // Exit the function early
    }

    isLoading.value = true
    try {
      const data = await $fetch(`/api/appointments/day`, {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        },
        params: { date: date.toISOString() }
      })
      for (const appointment of data) {
        const isExist = appointments.value.find(a => a.id === appointment.id)
        if (!isExist) {
          appointments.value.push(appointment)
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAppointmentCounts() {
    error.value = null
    try {
      const data = await $fetch<AppointmentCounts>('/api/appointments/count', {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      appointmentCounts.value = data
    } catch (err) {
      error.value = (err as Error).message
    }
  }

  async function checkAuth() {
    error.value = null
    try {
      const data = await $fetch('/api/check-admin', {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      isAdmin.value = data.isAdmin
    } catch (err) {
      error.value = (err as Error).message
      isAdmin.value = false
    }
  }
  function showDetails() {
    const { showPopup } = useWebAppPopup()
    const time = availableStore.selectedSlot?.time as unknown as Date
    const appointment = appointments.value.find(appointment => isSameHour(appointment.time, time))
    const title = `Запись на ${formatDateTime(time)}`
    const message = [
      appointment?.name ? `Клиент: ${appointment.name}` : '',
      appointment?.phoneNumber ? `Номер телефона: ${appointment.phoneNumber}` : '',
      appointment?.comment ? `Комментарий: ${appointment.comment}` : '',
    ].filter(Boolean).join('\n');
  
    showPopup({
      title,
      message,
      buttons: [
      {
        text: 'Закрыть',
        type: 'destructive',
        }
      ],
    })
  }


  


  async function onDateChange(newDate: Date) {
    currentDate.value = newDate
    await fetchAppointmentsByDate(newDate)
  }


  async function deleteAppointment(id: number) {
    error.value = null
    try {
      await cancelAppointment(id)
      bookedAppointmentsStore.removeAppointment(id)
      // Remove the appointment from the local state
      // Update appointment counts
      const index = appointments.value.findIndex(a => a.id === id)
      if (appointmentCounts.value) {
        appointmentCounts.value.totalCount--
        if (isToday(parseISO(appointments.value[index].time))) {
          appointmentCounts.value.todayCount--
        }
      }
      appointments.value.splice(index, 1)
      showNotification({
        type: 'success',
        message: 'Запись отменена',
      })
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Не удалось отменить запись',
      })
      error.value = (err as Error).message
      console.error('Error deleting appointment:', err)
    }
  }
  async function handleCancelAppointment(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      const { showPopup, onPopupClosed } = useWebAppPopup()
      const popupClosed = onPopupClosed(async (e: { button_id: string }) => {
        if (e.button_id !== 'cancelAppointment') {
          resolve(false)
          popupClosed.off()
          return
        }
        isCanceling.value = true  // Set canceling state to true
        try {
          await deleteAppointment(id)
          showNotification({type: 'success', message: 'Запись успешно отменена'})
          resolve(true)
        } catch (error) { 
          showNotification({type: 'error', message: 'Ошибка при отмене записи'})
          console.error('Error removing appointment:', error)
          resolve(false)
        } finally {
          isCanceling.value = false  // Reset canceling state
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
            id: 'cancelAppointment',
            type: 'default',
            text: 'Отменить запись'
          },
        ],
      })
    })
  }
  function addAppointmentToCurrendDate() {
    const stepStore = useStepStore()
    const calendarStore = useCalendarStore()
    calendarStore.setSelectedDate(currentDate.value)
    stepStore.goToTimeSlots()
  }

  // Add these new refs
  const dateRangePagination = ref<PaginationInfo | null>(null)

  // Add this new method
  async function fetchAppointmentsByDateRange(startDate: Date, endDate: Date, page: number = 1) {
    if (!isAdmin.value) return
    
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<DateRangeResponse>('/api/appointments', {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        },
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          page
        }
      })
      const tempAppointments = [] as Appointment[]
      for (const appointment of data.appointments) {
        const isExist = appointments.value.find(a => a.id === appointment.id)
        if (!isExist) {
          tempAppointments.push(appointment)
        }
      }
      appointments.value = [...appointments.value, ...tempAppointments]
      dateRangePagination.value = data.pagination
    } catch (err) {
      error.value = (err as Error).message
      console.error('Error fetching appointments by date range:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentDate,
    filteredAppointments,
    paginationInfo,
    isAdmin,
    error,
    disabledDays,
    isLoading,
    appointmentCounts,
    disabledDayDates,
    isCanceling,
    appointments,
    dateRangePagination,
    fetchAppointmentCounts,
    addAppointmentToCurrendDate,
    checkAuth,
    onDateChange,
    fetchAppointmentsByDate,
    showDetails,
    addAppointmentToList,
    handleCancelAppointment,
    fetchAppointmentsByDateRange,
  }
})
