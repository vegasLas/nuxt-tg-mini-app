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

  async function fetchBookedAppointments(startDate?: Date, endDate?: Date) {
    try {
      let query = { startDate: startDate?.toISOString(), endDate: endDate?.toISOString() }
      await disabledDaysStore.fetchDisabledDays()
      const response = await useFetch('/api/appointments/booked', {
        headers: {
          'x-init-data': useWebApp().initData
        },
        query
      })

      if (response.status.value === 'error') {
        throw new Error('Failed to fetch booked appointments')
      }
      if (response.data.value) {
        bookedAppointments.value = response.data.value
        return response.data.value
      }
    } catch (err) {
      isErrorFetchingBookedAppointments.value = true
      throw new Error('Failed to fetch booked appointments')
    }
  }

  async function fetchOpenWindows() {
    await fetchBookedAppointments()
    if (isErrorFetchingBookedAppointments.value) {
      console.error('Error fetching booked appointments')
      return
    }

    const now = new Date()
    const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })
    const startDate = isAfter(now, cutoffTime) ? addDays(now, 1) : now
    const endDate = addDays(startDate, 30)
    openWindowsStore.generateOpenWindows(startDate, endDate, bookedAppointments.value)
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
    if (!date) return

    const startDate = startOfMonth(date)
    const endDate = endOfMonth(date)
    const fetchedAppointments = await fetchBookedAppointments(startDate, endDate)
    
    if (fetchedAppointments) {
      openWindowsStore.generateOpenWindows(startDate, endDate, fetchedAppointments)
    }
  }

  return {
    bookedAppointments,
    isErrorFetchingBookedAppointments,
    removeAppointment,
    fetchOpenWindows,
    rescheduleAppointment,
    fetchOpenWindowsForAdmin,
  }
})
