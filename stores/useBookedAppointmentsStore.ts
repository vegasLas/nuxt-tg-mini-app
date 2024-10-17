import { useWebApp } from 'vue-tg'
import { 
  addDays, 
  startOfDay, 
  set, 
  isSameDay,
  getDay, 
  setHours, 
  format,
  parseISO,
} from 'date-fns'

export const useBookedAppointmentsStore = defineStore('bookedAppointments', () => {
  const bookedAppointments = ref<{ time: string, id: number }[]>([])
  const disabledDaysStore = useDisabledTimeStore()
  const isErrorFetchingBookedAppointments = ref(false)
  async function fetchBookedAppointments() {

    try {
      await disabledDaysStore.fetchDisabledDays()
      const response = await useFetch('/api/appointments/booked', {
        headers: {
          'x-init-data': useWebApp().initData
        }
      })

      if (response.status.value === 'error') {
        throw new Error('Failed to fetch booked appointments')
      }
      if (response.data.value) {
        bookedAppointments.value = response.data.value
      }
    } catch (err) {
      isErrorFetchingBookedAppointments.value = true
      throw new Error('Failed to fetch booked appointments')
    }
  }

  function getOpenWindows(startDate: Date, endDate: Date) {
    const workDays = [1, 2, 3, 4, 5] // Monday to Friday
    const workHours = Array.from({ length: 9 }, (_, i) => {
      const hour = 9 + i
      return {
        show: format(setHours(new Date(), hour), 'HH:00'),
        time: setHours(new Date(), hour),
        booked: false
      }
    })

    const openWindowsMap: { [key: string]: { date: Date; slots: { show: string; time: Date; booked: boolean }[] } } = {}
    const now = new Date()
    const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })

    for (let d = startOfDay(startDate); d <= endDate; d = addDays(d, 1)) {
      if (workDays.includes(getDay(d)) && !isDisabledDay(d)) {
        // Skip today if it's after 17:00
        if (isSameDay(d, now) && now > cutoffTime) {
          continue
        }

        const dateString = format(d, 'dd-MM-yyyy')
        openWindowsMap[dateString] = {
          date: d,
          slots: workHours.map(({ show, time }) => ({
            show,
            time: set(d, { hours: time.getHours(), minutes: 0, seconds: 0, milliseconds: 0 }),
            booked: bookedAppointments.value.some(appointment => 
              isSameDay(parseISO(appointment.time), d) && 
              parseISO(appointment.time).getHours() === time.getHours()
            )
          }))
        }
      }
    }

    return Object.values(openWindowsMap)
  }

  // Helper function to check if a day is disabled
  function isDisabledDay(date: Date): boolean {
    return disabledDaysStore.disabledDays.some(disabledDay => {
      if (!disabledDay.date) return false
      return isSameDay(date, parseISO(disabledDay.date))
    })
  }

  return {
    bookedAppointments,
    isErrorFetchingBookedAppointments,
    fetchBookedAppointments,
    getOpenWindows,
  }
})
