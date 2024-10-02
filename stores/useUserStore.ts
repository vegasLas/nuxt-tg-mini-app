import { defineStore } from 'pinia'
import { useWebApp } from 'vue-tg'
import type { Appointment } from '~/types'

export const useUserStore = defineStore('user', () => {
  const appointments = ref<Appointment[]>([])

  async function fetchUserAppointments() {
    try {
      const response = await useFetch('/api/appointments', {
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      if (!response.data.value) {
        throw new Error('Failed to fetch appointments')
      }
      appointments.value = response.data.value as Appointment[]
    } catch (error) {
      console.error('Error fetching user appointments:', error)
      return []
    }
  }

  async function removeAppointment(time: Date) {
    const id = appointments.value.find(appointment => appointment.time.getTime() === time.getTime())?.id
    try {
      const response = await useFetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })
      if (!response.data.value) {
        throw new Error('Failed to remove appointment')
      }
      await fetchUserAppointments()
    } catch (error) {
      console.error('Error removing appointment:', error)
    }
  }
  function hasAppointment(time: Date) {
    console.log('hasAppointment', appointments.value)
    return appointments.value.some(appointment => new Date(appointment.time).getTime() === time.getTime())
  }
  return {
    appointments,
	hasAppointment,
    fetchUserAppointments,
    removeAppointment,
  }
})