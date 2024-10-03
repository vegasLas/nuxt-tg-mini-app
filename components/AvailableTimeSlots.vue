<template>
  <div class="time-selector">
    <h2>Доступные окна</h2>
    <div class="time-slots-grid">
      <button
        v-for="slot in availableTimeSlots.availableTimeSlots"
        :key="slot.show"
        :class="['time-slot', { 
          booked: slot.booked || new Date(slot.time) <= new Date(),
          selected: availableTimeSlots.selectedTime === slot.time,
          'user-appointment': userStore.hasAppointment(slot.time),
        }]" 
        @click="handleSlotClick(slot)"
        :disabled="slot.booked && !userStore.hasAppointment(slot.time)"
      >
        <span class="time-icon">&#128339;</span> {{ slot.show }}
      </button>
    </div>
    <BackButton @click="availableTimeSlots.goBack()" />
    <MainButton
      :text="cancelMode ? 'Отменить запись' : 'Продолжить'"
      @click="cancelMode ? handleCancel() : availableTimeSlots.proceed()"
      :disabled="!availableTimeSlots.selectedTime && !cancelMode"
    />
  </div>

  <!-- Add popup component -->

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MainButton, BackButton } from 'vue-tg'
import { useWebAppPopup } from 'vue-tg'

const availableTimeSlots = useAvailableTimeSlots()
const userStore = useUserStore()
const cancelMode = ref(false)

const handleSlotClick = (slot: { time: Date, show: string }) => {
  if (userStore.hasAppointment(slot.time)) {
    availableTimeSlots.selectTimeSlot(slot)
    cancelMode.value = true
  } else {
    availableTimeSlots.selectTimeSlot(slot)
    cancelMode.value = false
  }
}

const handleCancel = () => {
  const { showPopup, onPopupClosed } = useWebAppPopup()
  onPopupClosed((e: { button_id: string }) => {
    if (e.button_id === 'removeAppointment') {
      userStore.removeAppointment(availableTimeSlots.selectedTime!)
      availableTimeSlots.unselectTimeSlot()
      cancelMode.value = false
    }
  }, {
    manual: true
  })
  showPopup({
    title: 'Отмена записи',
    message: 'Хотите отменить запись?',
    buttons: [
      {
        text: 'Закрыть',
        type: 'destructive',
      },
      {
        id: 'removeAppointment',
        type: 'default',
        text: 'Отменить запись'
      },
    ],
  })
}
</script>

<style scoped>
.time-selector {
  width: 80%;
  margin: 0 auto;
  padding: 1rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.time-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: #fff;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #495057;
  transition: all 0.3s ease;
  cursor: pointer;
}

.time-slot.selected {
  background-color: #4263eb;
  color: #fff;
  border-color: #4263eb;
}

.time-slot.booked {
  background-color: #f8f9fa;
  color: #adb5bd;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.time-slot.user-appointment {
  background-color: #ffd43b;
  color: #212529;
  border-color: #fab005;
  cursor: pointer;
}

.time-slot.user-appointment:hover {
  background-color: #fcc419;
}

.time-icon {
  margin-right: 0.5rem;
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Assuming BackButton and MainButton are custom components */
:deep(.back-button) {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

:deep(.back-button:hover) {
  background-color: #dee2e6;
}

:deep(.main-button) {
  background-color: #4263eb;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

:deep(.main-button:hover) {
  background-color: #3b5bdb;
}

:deep(.main-button:disabled) {
  background-color: #adb5bd;
  cursor: not-allowed;
}


.time-slot.cancel-mode:hover {
  background-color: #f03e3e;
}

:deep(.main-button.cancel) {
  background-color: #ff6b6b;
}

:deep(.main-button.cancel:hover) {
  background-color: #f03e3e;
}
</style>