export const useUserInfoStore = defineStore('userInfo', () => {
  const calendarStore = useCalendarStore()
  
  const name = ref('')
  
  const phone = ref('+79')
  const comment = ref('')
  const isSubmiting = ref(false)
  const isFormValid = computed(() => {
    const phoneRegex = /^\+7\d{10}$/
    return name.value.trim() !== '' && phoneRegex.test(phone.value.trim())
  })

  
  watch(name, (newName) => {
    const nameRegex = /^[А-ЯЁа-яё\s]+$/;
    if (!nameRegex.test(newName)) {
      name.value = ''; // Reset the name if it doesn't match the regex
    }
  }, { immediate: true })
  watch(phone, (newPhone, oldPhone) => {
    if (newPhone.includes('+') && newPhone.indexOf('+') !== 0) {
      phone.value = oldPhone || ''; // Return to oldPhone if '+' is in the center
    } else if (newPhone === '+' && oldPhone === '+79') {
      phone.value = '+79';
    } else if (newPhone === '+7' && oldPhone === '+79') {
      phone.value = '+79';
    } else if (!newPhone.startsWith('+79')) {
      phone.value = '+79' + newPhone.replace(/^(\+79|79|89)?/, '');
    }
  }, { immediate: true })
  

  async function submitForm() {
    isSubmiting.value = true
    const userStore = useUserStore()
    const availableTimeSlotsStore = useAvailableTimeSlots()
    const stepStore = useStepStore()
    
    try {
      const success = await userStore.submitUserAppointment({
        name: name.value,
        phoneNumber: phone.value,
        time: availableTimeSlotsStore.selectedSlot?.time as Date,
        comment: comment.value
      })
      if (success) {
        name.value = ''
        phone.value = ''
        comment.value = ''
        calendarStore.setSelectedDate(null)
        stepStore.goToCalendar()
      }
    } finally {
      isSubmiting.value = false
    }
  }

  return {
    name,
    phone,
    comment,
    isFormValid,
    isSubmiting,
    submitForm
  }
})
