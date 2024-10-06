import { defineStore } from 'pinia'
import { useWebApp, useWebAppPopup } from 'vue-tg'
import type { Appointment } from '~/types'
import { useAppointmentStore } from './useAppointmentStore'

export const useUserStore = defineStore('user', () => {
  const appointments = ref<Appointment[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(5)
  const nextLink = ref<string | null>(null)
  const isLoading = ref(false)
  const isRemoving = ref(false)

  const hasMoreAppointments = computed(() => currentPage.value < totalPages.value)

  async function fetchUserAppointments(page: number = 1) {
    isLoading.value = true
    try {
      const response = await useFetch(`/api/appointments?page=${page}`, {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        }
      })

      if (!response.data.value) {
        throw new Error('Failed to fetch appointments')
      }

      const result = response.data.value as {
        appointments: Appointment[],
        pagination: {
          currentPage: number,
          totalPages: number,
          totalItems: number,
          itemsPerPage: number,
          nextLink: string | null
        }
      }

      if (page === 1) {
        appointments.value = result.appointments
      } else {
        appointments.value.push(...result.appointments)
      }

      currentPage.value = result.pagination.currentPage
      totalPages.value = result.pagination.totalPages
      totalItems.value = result.pagination.totalItems
      itemsPerPage.value = result.pagination.itemsPerPage
      nextLink.value = result.pagination.nextLink
    } catch (error) {
      console.error('Error fetching user appointments:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function loadMoreAppointments() {
    if (hasMoreAppointments.value && nextLink.value) {
      await fetchUserAppointments(currentPage.value + 1)
    }
  }

  async function removeAppointment(time: Date) {
    const id = appointments.value.find(appointment => new Date(appointment.time).getTime() === time.getTime())?.id
    isRemoving.value = true
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
      await fetchUserAppointments(1)  // Refresh from the first page
      await useCalendarStore().fetchOpenWindows()
    } catch (error) {
      console.error('Error removing appointment:', error)
    } finally {
      isRemoving.value = false
    }
  }

  function hasAppointment(time: Date) {
    return appointments.value.some(appointment => new Date(appointment.time).getTime() === time.getTime())
  }

  function addAppointment(appointment: Appointment) {
    appointments.value.unshift(appointment)
    totalItems.value++
    if (appointments.value.length > itemsPerPage.value) {
      appointments.value.pop()
    }
  }

  function rescheduleAppointment(appointment: Omit<Appointment, 'userId' | 'user'>) {
    const appointmentStore = useAppointmentStore()
    appointmentStore.setReschedulingAppointment(appointment)
    appointmentStore.goBackToCalendar()
    appointmentStore.hideAppointmentsList()
  }

  function handleCancel(appointment: Omit<Appointment, 'userId' | 'user'>) {
    const { showPopup, onPopupClosed } = useWebAppPopup()
    onPopupClosed((e: { button_id: string }) => {
      if (e.button_id === 'removeAppointment') {
        removeAppointment(new Date(appointment.time))
      }
    }, {
      manual: true
    })
    showPopup({
      title: 'Отмена записи',
      message: 'Вы уверены, что хотите отменить эту запись?',
      buttons: [
        {
          text: 'Закрыть',
          type: 'destructive',
        },
        {
          id: 'removeAppointment',
          type: 'default',
          text: 'Отменить запись'
        },
      ],
    })
  }

  function formatDateTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  function isExpired(time: string): boolean {
    return new Date(time) < new Date()
  }

  return {
    appointments,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isLoading,
    hasMoreAppointments,
    isRemoving,
    hasAppointment,
    fetchUserAppointments,
    loadMoreAppointments,
    removeAppointment,
    addAppointment,
    rescheduleAppointment,
    handleCancel,
    formatDateTime,
    isExpired
  }
})