import { useWebApp } from 'vue-tg'
import type { Appointment } from '~/types'

export async function fetchUserAppointments(page: number = 1) {
  const response = await useFetch(`/api/appointments?page=${page}`, {
    method: 'GET',
    headers: {
      'x-init-data': useWebApp().initData
    }
  })

  if (!response.data.value) {
    throw new Error('Failed to fetch appointments')
  }

  return response.data.value as {
    appointments: Omit<Appointment, 'user'>[],
    pagination: {
      currentPage: number,
      totalPages: number,
      totalItems: number,
      itemsPerPage: number,
      nextLink: string | null
    }
  }
}

export async function removeAppointment(id: number) {
  const response = await $fetch<{ success: boolean }>(`/api/appointments/${id}`, {
    method: 'DELETE',
    headers: {
      'x-init-data': useWebApp().initData
    }
  })
  if (!response.success) {
    throw new Error('Failed to remove appointment')
  }
  return response
}

export async function submitAppointment(appointmentData: {
  name: string,
  phoneNumber: string,
  time: Date,
  comment: string
}) {
  const body = {
    ...appointmentData,
    booked: true
  }

  const response = await $fetch('/api/appointments', {
    method: 'POST',
    headers: {  
      'x-init-data': useWebApp().initData,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  if (!response) {
    throw new Error('Failed to submit appointment')
  }
  
  return response
}

export async function updateAppointment(id: number, updateData: Partial<Omit<Appointment, 'id' | 'user'>>) {
  const response = await $fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: {
      'x-init-data': useWebApp().initData,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  })
  
  if (!response) {
    throw new Error('Failed to update appointment')
  }
  
  return response
}