import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAppointmentStore } from './useAppointmentStore'
import type { Appointment } from '../types'
import { useWebApp } from 'vue-tg'

export const useUserInfoStore = defineStore('userInfo', () => {
  const name = ref('')
  const phone = ref('+79')
  const comment = ref('')
  const isLoading = ref(false)

  const isFormValid = computed(() => {
    const phoneRegex = /^\+7\d{10}$/
    return name.value.trim() !== '' && phoneRegex.test(phone.value.trim())
  })

  watch(phone, (newPhone, oldPhone) => {
    if (newPhone === '+' && oldPhone === '+79') {
      phone.value = '+79'
    } else if (newPhone === '+7' && oldPhone === '+79') {
      phone.value = '+79'
    } else if (!newPhone.startsWith('+79')) {
      phone.value = '+79' + newPhone.replace(/^(\+79|79|89)?/, '')
    }
  }, { immediate: true })
  
  async function submitForm() {
    isLoading.value = true
    const appointmentStore = useAppointmentStore()
    const body: {
      name: string,
      phoneNumber: string,
      time: Date,
      booked: boolean,
      comment: string
    } = {
      name: name.value,
      phoneNumber: phone.value,
      time: appointmentStore.selectedTime as Date,
      booked: true,
      comment: comment.value
    }
    try {
      const response = await useFetch('/api/appointments', {
        method: 'POST',
        headers: {  
          'x-init-data': useWebApp().initData,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.status.value === 'error') {
        throw new Error('Failed to submit appointment')
      }

      const result = response.data.value
      if (!result) {
        throw new Error('Failed to submit appointment')
      }
      useUserStore().appointments.unshift(result)
      name.value = ''
      phone.value = ''
      comment.value = ''
      appointmentStore.goBackToCalendar()
      await useCalendarStore().fetchOpenWindows()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    name,
    phone,
    comment,
    isFormValid,
    isLoading,
    submitForm
  }
})