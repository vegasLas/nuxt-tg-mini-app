import { useWebAppPopup } from 'vue-tg'
import type { Appointment } from '~/types'
import { fetchUserAppointments, removeAppointment, submitAppointment } from '~/api/appointments'

export const useUserStore = defineStore('user', () => {
  const appointments = ref<Appointment[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(5)
  const nextLink = ref<string | null>(null)
  const isLoading = ref(false)
  const isCanceling = ref(false)  // New state for tracking cancellation

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
      console.log(appointments.value)

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

  async function removeUserAppointment(time: Date) {
    const id = appointments.value.find(appointment => new Date(appointment.time).getTime() === time.getTime())?.id
    if (!id) return

    try {
      await removeAppointment(id)
      await fetchAppointments(1)  // Refresh from the first page
      await useCalendarStore().fetchOpenWindows()
    } catch (error) {
      console.error('Error removing appointment:', error)
    }
  }

  function hasAppointment(time: Date) {
    return appointments.value.some(appointment => new Date(appointment.time).getTime() === time.getTime())
  }



  async function handleCancelAppointment(time: string): Promise<boolean> {
    return new Promise((resolve) => {
      const { showPopup, onPopupClosed } = useWebAppPopup()
      const popupClosed = onPopupClosed(async (e: { button_id: string }) => {
        if (e.button_id !== 'removeAppointment') {
          resolve(false)
          return
        }
        isCanceling.value = true  // Set canceling state to true
        try {
          await removeUserAppointment(new Date(time))
          showNotification('success', 'Запись успешно отменена')
          resolve(true)
        } catch (error) { 
          showNotification('error', 'Ошибка при отмене записи')
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
            id: 'removeAppointment',
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
      
      appointments.value.unshift(response)
      const stepStore = useStepStore()
      const calendarStore = useCalendarStore()
      
      stepStore.goToCalendar()
      await calendarStore.fetchOpenWindows()
      
      showNotification('success', 'Запись прошла успешно')

      return true
    } catch (error) {
      console.error('Error submitting form:', error)
      
      showNotification('error', 'Не удалось создать запись. Попробуйте позже.')

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
    submitUserAppointment
  }
})
