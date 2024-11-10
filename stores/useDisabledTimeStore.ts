import { useWebApp } from 'vue-tg'
import { isSameDay, parseISO } from 'date-fns'
interface DisabledDay {
  id: string
  date: string | null
  slot: string | null
}

export const useDisabledTimeStore = defineStore('disabledDays', () => {
  const disabledDays = ref<DisabledDay[]>([])
  const isProcessing = ref(false)
  const error = ref<string | null>(null)
  const isErrorFetchingDisabledDays = ref(false)
  const adminStore = useAdminStore()
  function isDisabledDay(date: Date, checkAdmin: boolean = false): boolean {
    if (checkAdmin && adminStore.isAdmin) return false
    return disabledDays.value.some(disabledDay => {
      if (!disabledDay.date) return false
      return isSameDay(date, parseISO(disabledDay.date))
    })
  }
  async function fetchDisabledDays(startDate?: Date, endDate?: Date) {
    try {
      let query = { startDate: startDate?.toISOString(), endDate: endDate?.toISOString() }
      const response = await useFetch('/api/disabled-time', {
        headers: {
          'x-init-data': useWebApp().initData
        },
        query
      })

      if (response.status.value === 'error') {
        throw new Error('Failed to fetch disabled days')
      }
      if (response.data.value) {
        disabledDays.value = [...disabledDays.value, ...response.data.value]
        return response.data.value
      }
    } catch (err) {
      isErrorFetchingDisabledDays.value = true
      throw new Error('Failed to fetch disabled days')
    }
  }

  async function blockDay(date: Date) {
    isProcessing.value = true
    error.value = null
    try {
      const data = await $fetch('/api/disabled-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-init-data': useWebApp().initData
        },
        body: JSON.stringify({ date }),
      })
      disabledDays.value.push(data)
      // await bookedAppointmentsStore.fetchOpenWindows()
      showNotification({type: 'success', message: 'День успешно заблокирован'})
    } catch (err) {
      error.value = (err as Error).message
      showNotification({type: 'error', message: 'Не удалось заблокировать день'})
    } finally {
      isProcessing.value = false
    }
  }

  async function unblockDay(date: Date) {
    const id = disabledDays.value.find(day => day.date === date.toISOString())?.id
    if (!id) {
      showNotification({type: 'error', message: 'Произошла ошибка, день не разблокирован'})
      return
    }
    isProcessing.value = true
    error.value = null
    try {
      await $fetch(`/api/disabled-time/${id}`, {
        method: 'DELETE',
        headers: {
          'x-init-data': useWebApp().initData
        },
      })
      disabledDays.value = disabledDays.value.filter(day => day.id !== id)
      showNotification({type: 'success', message: 'День разблокирован'})
    } catch (err) {
      error.value = (err as Error).message
      showNotification({type: 'error', message: 'Не удалось разблокировать день'})
    } finally {
      isProcessing.value = false
    }
  }

  const disabledDayDates = computed(() => {
    return disabledDays.value.map(day => day.date)
  })
  function handleDay(date: Date) {
    isDisabledDay(date) 
    ? unblockDay(date) 
    : blockDay(date)
  }
  return {
    disabledDays,
    disabledDayDates,
    isProcessing,
    error,
    isErrorFetchingDisabledDays,
    isDisabledDay,
    fetchDisabledDays,
    handleDay
  }
})
