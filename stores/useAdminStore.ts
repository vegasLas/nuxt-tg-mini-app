import { defineStore } from 'pinia'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDisabledDaysStore } from './useDisabledDaysStore'
import { useWebApp } from 'vue-tg'

interface Appointment {
  id: number
  time: string
  booked: boolean
  userId: number
  user?: {
    id: number
    name: string
    email: string
  }
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  nextLink: string | null
}


export const useAdminStore = defineStore('admin', () => {
  const disabledDaysStore = useDisabledDaysStore()
  const { disabledDays, disabledDayDates } = storeToRefs(disabledDaysStore)
  const appointments = ref<Appointment[]>([])
  const paginationInfo = ref<PaginationInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = ref(false)

  const fetchAppointmentsByDate = async (date: string, page: number = 1) => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch(`/api/appointments`, {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        },
        params: { date, page }
      })
      appointments.value = data.appointments
      paginationInfo.value = data.pagination
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
      isAuthenticated.value = data.isAdmin
    } catch (err) {
      error.value = (err as Error).message
      isAuthenticated.value = false
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
    isAuthenticated,
    loading,
    error,
    disabledDays,
    disabledDayDates,
    checkAuth,
    fetchAppointmentsByDate,
    addDisabledDay: disabledDaysStore.addDisabledDay,
    removeDisabledDay: disabledDaysStore.removeDisabledDay,
    fetchDisabledDays: disabledDaysStore.fetchDisabledDays,
  }
})