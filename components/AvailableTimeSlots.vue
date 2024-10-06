<template>
  <div class="time-selector">
    <h2>Доступные окна</h2>
    <div v-if="availableTimeSlots.selectedDate" class="selected-date">
      {{ formatSelectedDate(availableTimeSlots.selectedDate) }}
    </div>
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
        :disabled="slot.booked && !userStore.hasAppointment(slot.time) || new Date(slot.time) <= new Date()"
      >
        <span v-if="userStore.hasAppointment(slot.time)" class="checkmark">✓</span>
        <span class="time-icon">&#128339;</span> {{ slot.show }}
      </button>
    </div>
    <BackButton @click="availableTimeSlots.goBack()" />
    <MainButton
      v-if="availableTimeSlots.selectedTime"
      :text="availableTimeSlots.cancelMode ? 'Отменить запись' : 'Продолжить'"
      @click="availableTimeSlots.cancelMode ? availableTimeSlots.handleCancel() : availableTimeSlots.proceed()"
      :disabled="!availableTimeSlots.selectedTime && !availableTimeSlots.cancelMode"
    />
  </div>
</template>

<script setup lang="ts">
import { MainButton, BackButton } from 'vue-tg'
import { useAvailableTimeSlots } from '~/stores/useAvailableTimeSlots'
import { useUserStore } from '~/stores/useUserStore'

const availableTimeSlots = useAvailableTimeSlots()
const userStore = useUserStore()

const handleSlotClick = (slot: { time: Date, show: string }) => {
  availableTimeSlots.selectTimeSlot(slot)
  
}
</script>

<style scoped>
.time-selector {
  width: 80%;
  margin: 0 auto;
  padding: 0.7rem 0.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
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
  position: relative;
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

.time-slot.user-appointment.selected {
  background-color: #ffbf00e4;
  color: #212529;
  border-color: #ffbf00e4;
}

.checkmark {
  color: #40c057;
  font-weight: bold;
  margin-right: 0.25rem;
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

/* Add styles for the selected date display */
.selected-date {
  font-size: 1.2rem;
  color: #000;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
}
</style>