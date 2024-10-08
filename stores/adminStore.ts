import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import notie from 'notie'

interface DisabledDay {
  id: number
  date: string
}

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

interface AppointmentResponse {
  appointments: Appointment[]
  pagination: PaginationInfo
}

export const useAdminStore = defineStore('admin', () => {
  const disabledDays = ref<DisabledDay[]>([])
  const appointments = ref<Appointment[]>([])
  const paginationInfo = ref<PaginationInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDisabledDays = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/disabled-days')
      if (!response.ok) throw new Error('Не удалось получить заблокированные дни')
      disabledDays.value = await response.json()
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  const addDisabledDay = async (date: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/api/disabled-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      if (!response.ok) throw new Error('Не удалось добавить заблокированный день')
      const newDisabledDay = await response.json()
      disabledDays.value.push(newDisabledDay)
      notie.alert({ type: 'success', text: 'Заблокированный день успешно добавлен' })
    } catch (err) {
      error.value = (err as Error).message
      notie.alert({ type: 'error', text: 'Не удалось добавить заблокированный день' })
    } finally {
      loading.value = false
    }
  }

  const removeDisabledDay = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/api/disabled-days/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Не удалось удалить заблокированный день')
      disabledDays.value = disabledDays.value.filter(day => day.id !== id)
      notie.alert({ type: 'success', text: 'Заблокированный день успешно удален' })
    } catch (err) {
      error.value = (err as Error).message
      notie.alert({ type: 'error', text: 'Не удалось удалить заблокированный день' })
    } finally {
      loading.value = false
    }
  }

  const fetchAppointmentsByDate = async (date: string, page: number = 1) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`/api/appointments?date=${date}&page=${page}`)
      if (!response.ok) throw new Error('Не удалось получить записи')
      const data: AppointmentResponse = await response.json()
      appointments.value = data.appointments
      paginationInfo.value = data.pagination
    } catch (err) {
      error.value = (err as Error).message
      notie.alert({ type: 'error', text: 'Не удалось получить записи' })
    } finally {
      loading.value = false
    }
  }

  const disabledDayDates = computed(() => {
    return disabledDays.value.map(day => day.date)
  })

  return {
    disabledDays,
    appointments,
    paginationInfo,
    loading,
    error,
    disabledDayDates,
    fetchDisabledDays,
    addDisabledDay,
    removeDisabledDay,
    fetchAppointmentsByDate,
  }
})