import { useWebApp } from 'vue-tg'
import { 
  addDays, 
  startOfMonth,
  endOfMonth,
  set, 
  isAfter,
  format,
  parseISO,
} from 'date-fns'

export const useBookedAppointmentsStore = defineStore('bookedAppointments', () => {
  const bookedAppointments = ref<{ time: string, id: number }[]>([])
  const isErrorFetchingBookedAppointments = ref(false)
  const disabledDaysStore = useDisabledTimeStore()
  const openWindowsStore = useOpenWindowsStore()
  const isLoading = ref(false)

  async function fetchBookedAppointments(startDate?: Date, endDate?: Date) {
    try {
      let query = { startDate: startDate?.toISOString(), endDate: endDate?.toISOString() }
      await disabledDaysStore.fetchDisabledDays(startDate, endDate)
      const response = await useFetch('/api/appointments/booked', {
        headers: {
          'x-init-data': useWebApp().initData
        },
        query
      })

      if (response.status.value === 'error') {
        throw new Error('Произошла ошибка при получении записей')
      }
      if (response.data.value) {
        const tempAppointments = [] as { time: string, id: number }[]
        for (const appointment of response.data.value) {
          const isExistingAppointment = bookedAppointments.value.find(app => app.id === appointment.id)
          if (!isExistingAppointment) {
            tempAppointments.push({ time: appointment.time, id: appointment.id })
          }
        }
        bookedAppointments.value = [...bookedAppointments.value, ...tempAppointments]
        return tempAppointments
      }
    } catch (err) {
      isErrorFetchingBookedAppointments.value = true
      throw new Error('Произошла ошибка при получении записей')
    }
  }

  async function fetchOpenWindows() {
    isLoading.value = true
    await fetchBookedAppointments()
    if (isErrorFetchingBookedAppointments.value) {
      console.error('Error fetching booked appointments')
      isLoading.value = false
      return
    }

    const now = new Date()
    const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })
    const startDate = isAfter(now, cutoffTime) ? addDays(now, 1) : now
    const endDate = addDays(startDate, 30)
    openWindowsStore.generateOpenWindows(startDate, endDate, bookedAppointments.value)
    isLoading.value = false
  }

  function removeAppointment(id: number) {
    const oldAppointment = bookedAppointments.value.find(appointment => appointment.id === id)
    if (oldAppointment) {
      bookedAppointments.value = bookedAppointments.value.filter(appointment => appointment.id !== id)
      const time = parseISO(oldAppointment.time)
      openWindowsStore.unbookSlot(time, id)
    }
  }

  function rescheduleAppointment(oldAppointment: { time: string, id: number }, newAppointment: { newTime: string, id: number }) {
    const index = bookedAppointments.value.findIndex(app => app.id === oldAppointment.id)
    if (index !== -1) {
      bookedAppointments.value[index].time = format(parseISO(newAppointment.newTime), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
    }

    const oldDate = parseISO(oldAppointment.time)
    const newDate = parseISO(newAppointment.newTime)

    openWindowsStore.unbookSlot(oldDate, oldAppointment.id)
    openWindowsStore.bookSlot(newDate, newAppointment.id)
  }

  async function fetchOpenWindowsForAdmin(date: Date) {
    isLoading.value = true
    if (!date) return
    
    const startDate = startOfMonth(date)
    const endDate = endOfMonth(date)
    const fetchedAppointments = await fetchBookedAppointments(startDate, endDate)
    
    if (fetchedAppointments) {
      openWindowsStore.generateOpenWindows(startDate, endDate, fetchedAppointments)
    }
    isLoading.value = false
  }
  function hasAppointmentOnDate(date: Date): boolean {
    return bookedAppointments.value.some(appointment => {
      const appointmentDate = new Date(appointment.time);
      return appointmentDate.toDateString() === date.toDateString();
    });
  }
  return {
    bookedAppointments,
    isErrorFetchingBookedAppointments,
    isLoading,
    hasAppointmentOnDate,
    fetchOpenWindowsForAdmin,
    rescheduleAppointment,
    removeAppointment,
    fetchOpenWindows
  }
})
