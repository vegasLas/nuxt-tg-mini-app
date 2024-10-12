import { useWebAppPopup } from 'vue-tg'
import type { Appointment } from '~/types'
import notie from 'notie'
import { fetchUserAppointments, removeAppointment, submitAppointment } from '~/api/appointments'

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

  async function fetchAppointments(page: number = 1) {
    isLoading.value = true
    try {
      const result = await fetchUserAppointments(page)

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
      await fetchAppointments(currentPage.value + 1)
    }
  }

  async function removeUserAppointment(time: Date) {
    const id = appointments.value.find(appointment => new Date(appointment.time).getTime() === time.getTime())?.id
    if (!id) return

    isRemoving.value = true
    try {
      await removeAppointment(id)
      await fetchAppointments(1)  // Refresh from the first page
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


  async function handleCancel(time: string): Promise<boolean> {
    return new Promise((resolve) => {
      const { showPopup, onPopupClosed } = useWebAppPopup()
      const popupClosed = onPopupClosed(async (e: { button_id: string }) => {
        if (e.button_id !== 'removeAppointment') {return}
        try {
          await removeUserAppointment(new Date(time))
          notie.alert({
            type: 'success',
            text: 'Запись успешно отменена',
            time: 2,
            position:  'bottom'
          })
          resolve(true)
        } catch (error) { 
          resolve(false)
          notie.alert({
            type: 'error',
            text: 'Ошибка при отмене записи',
            time: 2,
            position: 'bottom'
          })
          console.error('Error removing appointment:', error)
        }
        finally {
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
      
      notie.alert({
        type: 'success',
        text: 'Запись прошла успешно',
        time: 2,
        position: 'bottom'
      })

      return true
    } catch (error) {
      console.error('Error submitting form:', error)
      
      notie.alert({
        type: 'error',
        text: 'Не удалось создать запись. Попробуйте позже.',
        time: 2,
        position: 'bottom'
      })

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
    isRemoving,
    hasAppointment,
    fetchAppointments,
    loadMoreAppointments,
    removeUserAppointment,
    addAppointment,
    handleCancel,
    formatDateTime,
    isExpired,
    submitUserAppointment
  }
})
