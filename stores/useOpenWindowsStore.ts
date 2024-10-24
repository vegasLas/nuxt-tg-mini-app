import { 
  startOfDay, 
  set, 
  isSameDay,
  getDay, 
  setHours, 
  format,
  parseISO,
  addDays,
} from 'date-fns'
import { useAdminStore } from './useAdminStore'
import type { OpenWindow } from '~/types'
export const useOpenWindowsStore = defineStore('openWindows', () => {
  const openWindows = ref<OpenWindow[]>([])
  const disabledDaysStore = useDisabledTimeStore()

  

  function createWorkHours(currentDate: Date) {
    return Array.from({ length: 9 }, (_, i) => {
      const hour = 9 + i
      return {
        show: format(setHours(new Date(), hour), 'HH:00'),
        time: setHours(currentDate, hour),
        bookedAppointmentId: null
      }
    })
  }

  function createNewWindow(currentDate: Date, bookedAppointments: { time: string, id: number }[]) {
    const workHours = createWorkHours(currentDate)
    return {
      date: startOfDay(currentDate),
      isDisabled: disabledDaysStore.isDisabledDay(currentDate),
      slots: workHours.map(({ show, time }) => ({
        show,
        time: set(currentDate, { hours: time.getHours(), minutes: 0, seconds: 0, milliseconds: 0 }),
        bookedAppointmentId: bookedAppointments.find(appointment => 
          isSameDay(parseISO(appointment.time), currentDate) && 
          parseISO(appointment.time).getHours() === time.getHours()
        )?.id || null
      }))
    }
  }

  function updateOpenWindows(newWindow: OpenWindow) {
    const existingIndex = openWindows.value.findIndex(window => isSameDay(window.date, newWindow.date))
    if (existingIndex !== -1) {
      openWindows.value[existingIndex] = newWindow
    } else {
      openWindows.value.push(newWindow)
      openWindows.value.sort((a, b) => a.date.getTime() - b.date.getTime())
    }
  }

  function generateOpenWindows(startDate: Date, endDate: Date, bookedAppointments: { time: string, id: number }[]) {
    const workDays = [1, 2, 3, 4, 5] // Monday to Friday
    const now = new Date()
    const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })
	  const adminStore = useAdminStore()
    for (let d = startOfDay(startDate); d <= endDate; d = addDays(d, 1)) {
      if (adminStore.isAdmin || workDays.includes(getDay(d))) {
        if (isSameDay(d, now) && now > cutoffTime) continue

        const newWindow = createNewWindow(d, bookedAppointments)
        updateOpenWindows(newWindow)
      }
    }
  }

  function unbookSlot(date: Date, id: number) {
    const windowIndex = openWindows.value.findIndex(window => isSameDay(window.date, date))
    if (windowIndex !== -1) {
      const slotIndex = openWindows.value[windowIndex].slots.findIndex(
        slot => slot.bookedAppointmentId === id
      )
      if (slotIndex !== -1) {
        openWindows.value[windowIndex].slots[slotIndex].bookedAppointmentId = null
      }
    }
  }

  function bookSlot(date: Date, id: number) {
    const windowIndex = openWindows.value.findIndex(window => isSameDay(window.date, date))
    if (windowIndex !== -1) {
      const slotIndex = openWindows.value[windowIndex].slots.findIndex(
        slot => slot.time.getHours() === date.getHours()
      )
      if (slotIndex !== -1) {
        openWindows.value[windowIndex].slots[slotIndex].bookedAppointmentId = id
      }
    }
  }

  return {
    openWindows,
    generateOpenWindows,
    unbookSlot,
    bookSlot,
  }
})
