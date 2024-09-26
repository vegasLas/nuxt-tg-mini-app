<template>
  <div class="time-selector">
    <h2>Доступные временные слоты</h2>
    <div class="time-slots-grid">
      <button
        v-for="slot in availableTimeSlots"
        :key="slot"
        :class="['time-slot', { selected: selectedTime === slot }]"
        @click="selectTimeSlot(slot)"
      >
        <span class="time-icon">&#128339;</span> {{ formatTime(slot) }}
      </button>
    </div>
    <BackButton @click="$emit('back')" />
    <MainButton
      text="Продолжить"
      @click="$emit('proceed')"
      :disabled="!selectedTime"
    />
  </div>
</template>

<script setup lang="ts">
import { MainButton, BackButton } from 'vue-tg'

const props = defineProps<{
  availableTimeSlots: string[]
  selectedTime: string | null
}>()

const emit = defineEmits<{
  (e: 'update:selectedTime', value: string): void
  (e: 'proceed'): void
  (e: 'back'): void
}>()

function selectTimeSlot(slot: string): void {
  emit('update:selectedTime', slot)
}

function formatTime(time: string): string {
  return time // В 24-часовом формате время не нужно преобразовывать
}
</script>

<style scoped>
.time-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.time-slot {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-slot:hover {
  background-color: #f0f0f0;
}

.time-slot.selected {
  background-color: #e0e0e0;
  font-weight: bold;
}

.time-icon {
  margin-right: 8px;
}
</style>