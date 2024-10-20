import { useWebApp } from 'vue-tg'
import { 
  addDays, 
  startOfDay, 
  set, 
  isSameDay,
  getDay, 
  setHours, 
  isAfter,
  format,
  parseISO,
} from 'date-fns'

export const useBookedAppointmentsStore = defineStore('bookedAppointments', () => {
  const bookedAppointments = ref<{ time: string, id: number }[]>([])
  const disabledDaysStore = useDisabledTimeStore()
  const isErrorFetchingBookedAppointments = ref(false)
  const openWindows = ref<{ date: Date; slots: { show: string; time: Date, bookedAppointmentId: number | null }[] }[]>([])
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
  async function fetchOpenWindows() {
    await fetchBookedAppointments()
    if (isErrorFetchingBookedAppointments.value) {
      console.error(isErrorFetchingBookedAppointments.value)
      return
    }

    const now = new Date()
    const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })
    const startDate = isAfter(now, cutoffTime) ? addDays(now, 1) : now
    const endDate = addDays(startDate, 30)
    openWindows.value = getOpenWindows(startDate, endDate)
  }
  function getOpenWindows(startDate: Date, endDate: Date) {
    const workDays = [1, 2, 3, 4, 5] // Monday to Friday
    const workHours = Array.from({ length: 9 }, (_, i) => {
      const hour = 9 + i
      return {
        show: format(setHours(new Date(), hour), 'HH:00'),
        time: setHours(new Date(), hour),
        bookedAppointmentId: null
      }
    })

    const openWindowsMap: { [key: string]: { date: Date; slots: { show: string; time: Date; bookedAppointmentId: number | null }[] } } = {}
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
            bookedAppointmentId: bookedAppointments.value.find(appointment => 
              isSameDay(parseISO(appointment.time), d) && 
              parseISO(appointment.time).getHours() === time.getHours()
            )?.id || null
          }))
        }
      }
    }

    return Object.values(openWindowsMap)
  }
  function removeAppointment(id: number) {
    const oldAppointment = bookedAppointments.value.find(appointment => appointment.id === id);
    if (oldAppointment) {
      bookedAppointments.value = bookedAppointments.value.filter(appointment => appointment.id !== id);
      const time = parseISO(oldAppointment.time);
      unbookOldSlot(time, id);
    }
  }
  // Helper function to check if a day is disabled
  function isDisabledDay(date: Date): boolean {
    return disabledDaysStore.disabledDays.some(disabledDay => {
      if (!disabledDay.date) return false
      return isSameDay(date, parseISO(disabledDay.date))
    })
  }
  function unbookOldSlot(oldDate: Date, id: number) {
    const oldWindowIndex = openWindows.value.findIndex(window => isSameDay(window.date, oldDate))
    if (oldWindowIndex !== -1) {
      const oldSlotIndex = openWindows.value[oldWindowIndex].slots.findIndex(
        slot => slot.bookedAppointmentId === id
      )
      if (oldSlotIndex !== -1) {
        openWindows.value[oldWindowIndex].slots[oldSlotIndex].bookedAppointmentId = null
      }
    }
  }
  function bookNewSlot(newTime: Date, id: number) {
    const newWindowIndex = openWindows.value.findIndex(window => isSameDay(window.date, newTime))
    if (newWindowIndex !== -1) {
      const newSlotIndex = openWindows.value[newWindowIndex].slots.findIndex(
        slot => slot.time.getHours() === newTime.getHours()
      )
      if (newSlotIndex !== -1) {
        openWindows.value[newWindowIndex].slots[newSlotIndex].bookedAppointmentId = id
      }
    }
  }
  function rescheduleAppointment(oldAppointment: { time: string, id: number }, newAppointment: {newTime: string, id: number}) {
    // Update the bookedAppointments array
    const index = bookedAppointments.value.findIndex(app => app.id === oldAppointment.id)
    if (index !== -1) {
      bookedAppointments.value[index].time = format(newAppointment.newTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
    }

    // Update the openWindows
    const oldDate = parseISO(oldAppointment.time)
    const newDate = parseISO(newAppointment.newTime)

    // Find and update the old slot
    unbookOldSlot(oldDate, oldAppointment.id);
    // Find and update the new slot
    bookNewSlot(newDate, newAppointment.id);
  }

  return {
    bookedAppointments,
    isErrorFetchingBookedAppointments,
    openWindows,
    removeAppointment,
    fetchOpenWindows,
    rescheduleAppointment,
  }
})
