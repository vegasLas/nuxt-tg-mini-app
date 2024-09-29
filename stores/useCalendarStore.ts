import { ref, computed } from 'vue'
import type { CalendarAttribute, Appointment } from '~/types'

export const useCalendarStore = defineStore('calendar', () => {
  const openWindows = ref<{ date: Date; slots: string[] }[]>([])

  const calendarAttributes = computed<CalendarAttribute[]>(() => {
    return openWindows.value.map(window => ({
      dot: window.slots.length > 0 ? 'green' : 'red',
      dates: window.date,
      popover: {
        label: window.slots.length > 0 ? 'Есть свободные окна' : 'Все окна заняты'
      }
    }))
  })

  async function fetchOpenWindows() {
    try {
      const response = await fetch('/api/appointments')
      const appointments = await response.json() as Appointment[]

      const workDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      const workHours = Array.from({ length: 9 }, (_, i) => `${9 + i}:00`)

      const openWindowsMap: { [key: string]: { date: Date; slots: string[] } } = {}

      const today = new Date()
      const endDate = new Date()
      endDate.setDate(today.getDate() + 30)

      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const day = d.toLocaleDateString('en-US', { weekday: 'short' })
        if (workDays.includes(day)) {
          const dateString = d.toDateString()
          openWindowsMap[dateString] = { date: new Date(d), slots: [...workHours] }
        }
      }

      if (appointments.length > 0) {
        appointments.forEach((appointment) => {
          const date = new Date(appointment.time)
          const dateString = date.toDateString()
          const appointmentTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

          if (openWindowsMap[dateString]) {
            const appointmentTimeIndex = openWindowsMap[dateString].slots.indexOf(appointmentTime)
            if (appointmentTimeIndex !== -1) {
              openWindowsMap[dateString].slots.splice(appointmentTimeIndex, 1)
            }
          }
        })
      }

      openWindows.value = Object.values(openWindowsMap)
    } catch (error) {
      console.error('Error fetching open windows:', error)
    }
  }

  return {
    openWindows,
    calendarAttributes,
    fetchOpenWindows
  }
})