import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWebApp } from 'vue-tg'
import { useCalendarStore } from './useCalendarStore'

interface DisabledDay {
  id: string
  date: string
  createdAt: string
  startTime: string
  endTime: string
  updatedAt: string
}

export const useDisabledTimeStore = defineStore('disabledDays', () => {
  const disabledDays = ref<DisabledDay[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const calendarStore = useCalendarStore()

  const fetchDisabledDays = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch('/api/disabled-time', {
        method: 'GET',
        headers: {
          'x-init-data': useWebApp().initData
        }
      })
      disabledDays.value = response
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
      await $fetch('/api/disabled-time', {
        method: 'POST',
        headers: {
          'x-init-data': useWebApp().initData
        },
        body: { date },
      })
      await calendarStore.fetchOpenWindows()
      showNotification('success', 'Заблокированный день успешно добавлен')
    } catch (err) {
      error.value = (err as Error).message
      showNotification('error', 'Не удалось добавить заблокированный день')
    } finally {
      loading.value = false
    }
  }

  const removeDisabledDay = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/disabled-time/${id}`, {
        method: 'DELETE',
        headers: {
          'x-init-data': useWebApp().initData
        },
      })
      disabledDays.value = disabledDays.value.filter(day => day.id !== id)
      showNotification('success', 'Заблокированный день успешно удален')
    } catch (err) {
      error.value = (err as Error).message
      showNotification('error', 'Не удалось удалить заблокированный день')
    } finally {
      loading.value = false
    }
  }

  const disabledDayDates = computed(() => {
    return disabledDays.value.map(day => day.date)
  })

  return {
    disabledDays,
    disabledDayDates,
    loading,
    error,
    fetchDisabledDays,
    addDisabledDay,
    removeDisabledDay,
  }
})
