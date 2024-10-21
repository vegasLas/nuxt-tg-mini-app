import { defineStore } from 'pinia'
import type { Appointment } from '~/types'
import { fetchUserAppointments } from '~/api/appointments'
import { useAppointmentStore } from './useAppointmentStore'
import { useAdminStore } from './useAdminStore'

export const useUserStore = defineStore('user', () => {
  const appointments = ref<Appointment[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(5)
  const nextLink = ref<string | null>(null)
  const isLoading = ref(false)

  const appointmentStore = useAppointmentStore()
  const adminStore = useAdminStore()

  const hasMoreAppointments = computed(() => currentPage.value < totalPages.value)
  function hasAppointmentOnDate(date: Date): boolean {
    return appointments.value.some(appointment => {
      const appointmentDate = new Date(appointment.time);
      return appointmentDate.toDateString() === date.toDateString();
    });
  }
  async function fetchAppointments(page: number = 1) {
    isLoading.value = true
    try {
      const result = await fetchUserAppointments(page)
      appointments.value = page === 1 ? result.appointments : [...appointments.value, ...result.appointments]

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
      await fetchAppointments(currentPage.value + 1)
    }
  }
  async function handleCancelAppointment(id: number) {
    const isCanceled = await appointmentStore.handleCancelAppointment(id)
    if (isCanceled) {
      removeUserAppointmentOfList(id)
      totalItems.value--
    }
    return isCanceled
  }
  function hasAppointment(id: number) {
    return appointments.value.some(appointment => appointment.id === id)
  }

  

  async function submitUserAppointment(appointmentData: {
    name: string,
    phoneNumber: string,
    time: Date,
    comment: string
  }) {
    const response = await appointmentStore.submitAppointmentData(appointmentData)
    if (response) {
      if (adminStore.isAdmin) {
        adminStore.addAppointmentToList(response)
      } else {
        appointments.value.unshift(response)
      }
      return true
    }
    return false
  }

  async function updateUserAppointment(id: number, updateData: Partial<Omit<Appointment, 'id' | 'user'>>) {
    const updatedAppointment = await appointmentStore.updateAppointmentData(id, updateData)
    if (updatedAppointment) {
      const index = appointments.value.findIndex(app => app.id === id)
      if (index !== -1) {
        appointments.value[index] = updatedAppointment
      }
      return true
    }
    return false
  }

  async function rescheduleUserAppointment(oldAppointment: Appointment, newTime: Date) {
    const updatedAppointment = await appointmentStore.rescheduleAppointment(oldAppointment, newTime)
    if (updatedAppointment) {
      const index = appointments.value.findIndex(app => app.id === oldAppointment.id)
      if (index !== -1) {
        appointments.value[index] = updatedAppointment
      }
      return true
    }
    return false
  }
  function removeUserAppointmentOfList(id: number) {
    const index = appointments.value.findIndex(app => app.id === id)
    if (index !== -1) {
      appointments.value.splice(index, 1)
    }
  }
  return {
    appointments,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isLoading,
    hasMoreAppointments,
    handleCancelAppointment,
    hasAppointmentOnDate,
    removeUserAppointmentOfList,
    hasAppointment,
    fetchAppointments,
    loadMoreAppointments,
    submitUserAppointment,
    updateUserAppointment,
    rescheduleUserAppointment,
  }
})
