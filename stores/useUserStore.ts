import { useWebAppPopup } from 'vue-tg'
import type { Appointment } from '~/types'
import { fetchUserAppointments, cancelAppointment, submitAppointment, updateAppointment } from '~/api/appointments'
import { parseISO, format } from 'date-fns'

export const useUserStore = defineStore('user', () => {
  const appointments = ref<Appointment[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(5)
  const nextLink = ref<string | null>(null)
  const isLoading = ref(false)
  const isCanceling = ref(false)  // New state for tracking cancellation
  const bookedAppointmentsStore = useBookedAppointmentsStore()

  const hasMoreAppointments = computed(() => currentPage.value < totalPages.value)
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

  async function removeUserAppointment(id: number) {
    try {
      await cancelAppointment(id)
      appointments.value = appointments.value.filter(appointment => appointment.id !== id)
      bookedAppointmentsStore.removeAppointment(id)
    } catch (error) {
      console.error('Error removing appointment:', error)
    }
  }

  function hasAppointment(time: Date) {
    return appointments.value.some(appointment => new Date(appointment.time).getTime() === time.getTime())
  }

  const hasAppointmentOnDate = (date: Date | null): boolean => {
    if (!date) return false
    return appointments.value.some(appointment => {
      const appointmentDate = new Date(appointment.time)
      return appointmentDate.toDateString() === date.toDateString()
    })
  }

  async function handleCancelAppointment(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      const { showPopup, onPopupClosed } = useWebAppPopup()
      const popupClosed = onPopupClosed(async (e: { button_id: string }) => {
        if (e.button_id !== 'cancelAppointment') {
          resolve(false)
          return
        }
        isCanceling.value = true  // Set canceling state to true
        try {
          await removeUserAppointment(id)
          showNotification({type: 'success', message: 'Запись успешно отменена'})
          resolve(true)
        } catch (error) { 
          showNotification({type: 'error', message: 'Ошибка при отмене записи'})
          console.error('Error removing appointment:', error)
          resolve(false)
        } finally {
          isCanceling.value = false  // Reset canceling state
          popupClosed.off()
        }
      }, { manual: true })
      showPopup({
        title: 'Отмена записи',
        message: 'Хотите отменить запись?',
        buttons: [
          {
            text: 'Закрыть',
            type: 'destructive',
          },
          {
            id: 'cancelAppointment',
            type: 'default',
            text: 'Отменить запись'
          },
        ],
      })
    })
  }


  async function submitUserAppointment(appointmentData: {
    name: string,
    phoneNumber: string,
    time: Date,
    comment: string
  }) {
    try {
      const response = await submitAppointment(appointmentData)
      const adminStore = useAdminStore()
      if (adminStore.isAdmin) {
        adminStore.addAppointmentToList(response)
      } else {
        appointments.value.unshift(response)
      }
      await bookedAppointmentsStore.fetchOpenWindows()
      showNotification({type: 'success', message: 'Запись прошла успешно'})
      return true
    } catch (error) {
      console.error('Error submitting form:', error)
      
      showNotification({type: 'error', message: 'Не удалось создать запись. Попробуйте позже.'})

      return false
    }
  }

  async function updateUserAppointment(id: number, updateData: Partial<Omit<Appointment, 'id' | 'user'>>) {
    try {
      const updatedAppointment = await updateAppointment(id, updateData)
      const index = appointments.value.findIndex(app => app.id === id)
      if (index !== -1) {
        appointments.value[index] = updatedAppointment
      }
      showNotification({type: 'success', message: 'Запись успешно обновлена'})
      return true
    } catch (error) {
      console.error('Error updating appointment:', error)
      showNotification({type: 'error', message: 'Не удалось обновить запись. Попробуйте позже.'})
      return false
    }
  }

  async function rescheduleUserAppointment(oldAppointment: Appointment, newTime: Date) {
    try {
      // Update the appointment in the backend
      const updatedAppointment = await updateAppointment(oldAppointment.id, { time: format(newTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") })

      // Update the appointment in the user's appointments list
      const index = appointments.value.findIndex(app => app.id === oldAppointment.id)
      if (index !== -1) {
        appointments.value[index] = updatedAppointment
      }

      // Update the booked appointments and open windows
      bookedAppointmentsStore.rescheduleAppointment(
        { time: oldAppointment.time, id: oldAppointment.id },
        { newTime: format(newTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), id: updatedAppointment.id }
      )

      showNotification({type: 'success', message: 'Запись успешно перенесена'})
      return true
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      showNotification({type: 'error', message: 'Не удалось перенести запись. Попробуйте позже.'})
      return false
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
    isCanceling,  // Add isCanceling to the returned object
    hasAppointment,
    fetchAppointments,
    loadMoreAppointments,
    handleCancelAppointment,
    submitUserAppointment,
    hasAppointmentOnDate,
    updateUserAppointment,
    rescheduleUserAppointment
  }
})
