import { defineStore } from 'pinia'
import { useWebApp } from 'vue-tg'
import type { Appointment } from '~/types'

export const useUserStore = defineStore('user', () => {
  const appointments = ref<Appointment[]>([])
 
  async function fetchUserAppointments() {
    try {
      const response = await useFetch('/api/appointments', {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      if (!response.data.value) {
        throw new Error('Failed to fetch appointments')
      }
      const result = response.data.value as unknown as Appointment[]
      appointments.value = result
    } catch (error) {
      console.error('Error fetching user appointments:', error)
      return []
    }
  }

  async function removeAppointment(time: Date) {
    const id = appointments.value.find(appointment => new Date(appointment.time).getTime() === new Date(time).getTime())?.id
    try {
      const response = await $fetch<{ success: boolean }>(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      if (!response.success) {
        throw new Error('Failed to remove appointment')
      }
      await fetchUserAppointments()
	  useAppointmentStore().goBackToCalendar()
    } catch (error) {
      console.error('Error removing appointment:', error)
    }
  }
  function hasAppointment(time: Date) {
    return appointments.value.some(appointment => new Date(appointment.time).getTime() === time.getTime())
  }
  return {
    appointments,
	hasAppointment,
    fetchUserAppointments,
    removeAppointment,
  }
})