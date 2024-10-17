import { useWebApp } from 'vue-tg'

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
  const { disabledDays, disabledDayDates } = storeToRefs(disabledDaysStore)
  const appointments = ref<Appointment[]>([])
  const paginationInfo = ref<PaginationInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAdmin = ref(false)

  const fetchAppointmentsByDate = async (date: string) => {
    loading.value = true
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
      loading.value = false
    }
  }

  const checkAuth = async () => {
    loading.value = true
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
      loading.value = false
    }
  }
  onMounted(async () => {
    await checkAuth()
  })

  return {
    appointments,
    paginationInfo,
    isAdmin,
    loading,
    error,
    disabledDays,
    disabledDayDates,
    checkAuth,
    fetchAppointmentsByDate,
    addDisabledDay(date: string) {
      disabledDaysStore.addDisabledDay(date)
    },
    removeDisabledDay(id: string) {
      disabledDaysStore.removeDisabledDay(id)
    },
  }
})