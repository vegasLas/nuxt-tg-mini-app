
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
    const userStore = useUserStore()
    const appointmentStore = useAppointmentStore()

    try {
      const success = await userStore.submitUserAppointment({
        name: name.value,
        phoneNumber: phone.value,
        time: appointmentStore.selectedTime as Date,
        comment: comment.value
      })

      if (success) {
        name.value = ''
        phone.value = ''
        comment.value = ''
      }
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
