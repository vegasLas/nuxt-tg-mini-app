import type { CalendarAttribute } from '~/types'
import { useWebApp } from 'vue-tg'

export const useCalendarStore = defineStore('calendar', () => {
  const openWindows = ref<{ date: Date; slots: { show: string; time: Date, booked: boolean }[] }[]>([])
  const userStore = useUserStore() // Add this line to use the user store
  
  const calendarAttributes = computed<CalendarAttribute[]>(() => {
    return openWindows.value.map(window => {
      const hasUserAppointment = userStore.appointments.some(appointment => 
        new Date(appointment.time).toDateString() === window.date.toDateString()
      )
      
      let dotColor = 'red'
      if (hasUserAppointment) {
        dotColor = 'yellow'
      } else if (window.slots.some(slot => !slot.booked)) {
        dotColor = 'green'
      }

      return {
        dot: dotColor,
        dates: window.date,
        popover: {
          label: hasUserAppointment 
            ? 'У вас есть запись на этот день'
            : window.slots.some(slot => !slot.booked) 
              ? 'Есть свободные окна' 
              : 'Все окна заняты'
        }
      }
    })
  })

  async function fetchOpenWindows() {
    try {
      const response = await useFetch('/api/appointments/booked', {
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      if (response.status.value === 'error') {
        throw new Error('Failed to fetch booked appointments')
      }
      const bookedAppointments = response.data.value as unknown as { time: Date }[]

      const workDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      const workHours = Array.from({ length: 9 }, (_, i) => {
        const hour = 9 + i
        return {
          show: `${hour}:00`,
          time: new Date(0, 0, 0, hour, 0, 0),
          booked: false
        }
      })

      const openWindowsMap: { [key: string]: { date: Date; slots: { show: string; time: Date; booked: boolean }[] } } = {}

      const today = new Date()
      const endDate = new Date()
      endDate.setDate(today.getDate() + 30)

      // Check if it's past 19:00 today
      const isPastWorkingHours = today.getHours() >= 19

      // Create initial open windows for all work days
      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const day = d.toLocaleDateString('en-US', { weekday: 'short' })
        if (workDays.includes(day)) {
          // Skip today if it's past working hours
          if (d.toDateString() === today.toDateString() && isPastWorkingHours) {
            continue
          }

          const dateString = d.toDateString()
          openWindowsMap[dateString] = {
            date: new Date(d),
            slots: workHours.map(({ show, time }) => ({
              show,
              time: new Date(d.getFullYear(), d.getMonth(), d.getDate(), time.getHours(), time.getMinutes()),
              booked: false
            }))
          }
        }
      }
      // Mark booked slots
      bookedAppointments?.forEach((appointment) => {
        const appointmentDate = new Date(appointment.time)
        const dateString = appointmentDate.toDateString()

        if (openWindowsMap[dateString]) {
          openWindowsMap[dateString].slots = openWindowsMap[dateString].slots.map(slot => {
            if (slot.time.getTime() === appointmentDate.getTime()) {
              return { ...slot, booked: true }
            }
            return slot
          })
        }
      })

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