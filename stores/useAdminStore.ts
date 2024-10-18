import { useWebApp, useWebAppPopup } from 'vue-tg'
import { isSameHour } from 'date-fns'
interface Appointment {
  id: number
  time: string
  booked: boolean
  comment: string | null
  phoneNumber: string
  userId: number
  user: {
    username: string | null
    name: string | null
  } | null
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  nextLink: string | null
}

export const useAdminStore = defineStore('admin', () => {
  const disabledDaysStore = useDisabledTimeStore()
  const availableStore = useAvailableTimeSlots()
  const { disabledDays, disabledDayDates } = storeToRefs(disabledDaysStore)
  const appointments = ref<Appointment[]>([])
  const paginationInfo = ref<PaginationInfo | null>(null)
  const error = ref<string | null>(null)
  const isAdmin = ref(false)

  const fetchAppointmentsByDate = async (date: string) => {
    error.value = null
    try {
      const data = await $fetch(`/api/appointments/day`, {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        },
        params: { date }
      })
      appointments.value = data
    } catch (err) {
      error.value = (err as Error).message
    } finally {
    }
  }

  async function checkAuth() {
    error.value = null
    try {
      const data = await $fetch('/api/check-admin', {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      isAdmin.value = data.isAdmin
      if (isAdmin.value) {
        await disabledDaysStore.fetchDisabledDays()
      }
    } catch (err) {
      error.value = (err as Error).message
      isAdmin.value = false
    } finally {
    }
  }
  function showDetails() {
    const { showPopup } = useWebAppPopup()
    const time = availableStore.selectedSlot?.time as unknown as Date
    const appointment = appointments.value.find(appointment => isSameHour(appointment.time, time))
    const title = `Запись на ${formatDateTime(time)}`
    const message = [
      appointment?.user?.name ? `Клиент: ${appointment.user.name}` : '',
      appointment?.user?.username ? `tg: @${appointment.user.username}` : '',
      appointment?.phoneNumber ? `Номер телефона: ${appointment.phoneNumber}` : '',
      appointment?.comment ? `Комментарий: ${appointment.comment}` : '',
    ].filter(Boolean).join('\n');
  
    showPopup({
      title,
      message,
      buttons: [
      {
        text: 'Закрыть',
        type: 'destructive',
        }
      ],
    })
  }
  onMounted(async () => {
    await checkAuth()
  })

  return {
    appointments,
    paginationInfo,
    isAdmin,
    error,
    disabledDays,
    disabledDayDates,
    checkAuth,
    fetchAppointmentsByDate,
    showDetails,
    addDisabledDay(date: string) {
      disabledDaysStore.addDisabledDay(date)
    },
    removeDisabledDay(id: string) {
      disabledDaysStore.removeDisabledDay(id)
    },
  }
})