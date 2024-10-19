<template>
  <div class="date-slider">
    <button @click="changeDate(-1)" class="arrow-button">&#9664;</button>
    <div class="date-display" :class="{ 'weekend': isWeekend(currentDate.getDay()) }">
      {{ formattedDate }}
      <span v-if="isWeekend(currentDate.getDay())" class="weekend-indicator">Выходной</span>
    </div>
    <button @click="changeDate(1)" class="arrow-button">&#9654;</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { addDays } from 'date-fns'
const props = defineProps<{
  initialDate: Date
}>()

const emit = defineEmits<{
  (e: 'dateChange', date: Date): void
}>()

const currentDate = ref(props.initialDate)

const formattedDate = computed(() => {
  return new Intl.DateTimeFormat('ru-RU', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(currentDate.value)
})


function changeDate(days: number) {
  currentDate.value = addDays(currentDate.value, days)
  emit('dateChange', currentDate.value)
}
</script>

<style scoped>
.date-slider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.arrow-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #495057;
  padding: 5px 10px;
  transition: background-color 0.3s;
}

.arrow-button:hover {
  background-color: #e9ecef;
  border-radius: 4px;
}

.date-display {
  font-size: 18px;
  font-weight: bold;
  color: #495057;
  text-align: center;
  flex-grow: 1;
  position: relative;
}

.date-display.weekend {
  color: #6c757d;
}

.weekend-indicator {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #6c757d;
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
}
</style>
