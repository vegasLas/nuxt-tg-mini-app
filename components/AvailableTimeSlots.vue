<template>
  <div class="time-selector">
    <h2>Доступные окна</h2>
    <div class="time-slots-grid">
      <button
        v-for="slot in availableTimeSlots.availableTimeSlots"
        :key="slot.show"
        :class="['time-slot', { 
          selected: availableTimeSlots.selectedTime === slot.time,
          booked: slot.booked
        }]"
        @click="availableTimeSlots.selectTimeSlot(slot)"
        :disabled="slot.booked"
      >
        <span class="time-icon">&#128339;</span> {{ slot.show }}
      </button>
    </div>
    <BackButton @click="availableTimeSlots.goBack()" />
    <MainButton
      text="Продолжить"
      @click="availableTimeSlots.proceed()"
      :disabled="!availableTimeSlots.selectedTime"
    />
  </div>
</template>

<script setup lang="ts">
import { MainButton, BackButton } from 'vue-tg'
import { useAvailableTimeSlots } from '~/stores/useAvailableTimeSlots'
const availableTimeSlots = useAvailableTimeSlots()
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

.time-slot:hover:not(.booked) {
  background-color: #e9ecef;
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
</style>