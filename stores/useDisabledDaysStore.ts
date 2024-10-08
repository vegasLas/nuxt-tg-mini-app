import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import notie from 'notie'
import { useWebApp } from 'vue-tg'

interface DisabledDay {
  id: string
  date: string
  createdAt: string
  startTime: string
  endTime: string
  updatedAt: string
}

export const useDisabledDaysStore = defineStore('disabledDays', () => {
  const disabledDays = ref<DisabledDay[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const calendarStore = useCalendarStore()

  const fetchDisabledDays = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch('/api/disabled-days', {
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
      await $fetch('/api/disabled-days', {
        method: 'POST',
        headers: {
          'x-init-data': useWebApp().initData
        },
        body: { date },
      })
	  await calendarStore.fetchOpenWindows()
	  notie.alert({ type: 'success', text: 'Заблокированный день успешно добавлен' })
    } catch (err) {
      error.value = (err as Error).message
      notie.alert({ type: 'error', text: 'Не удалось добавить заблокированный день' })
    } finally {
      loading.value = false
    }
  }

  const removeDisabledDay = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/disabled-days/${id}`, {
        method: 'DELETE',
        headers: {
          'x-init-data': useWebApp().initData
        },
      })
      disabledDays.value = disabledDays.value.filter(day => day.id !== id)
      notie.alert({ type: 'success', text: 'Заблокированный день успешно удален' })
    } catch (err) {
      error.value = (err as Error).message
      notie.alert({ type: 'error', text: 'Не удалось удалить заблокированный день' })
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