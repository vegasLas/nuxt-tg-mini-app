<template>
  <div class="calendar-container">
    <VCalendar
      size="large"
      locale="ru-RU"
      @did-move="calendarStore.onMonthChange"
      :attributes="calendarStore.calendarAttributes"
      :disabled-dates="[
        {
          repeat: {
            weekdays: [1, 7],
          },
        },
      ]"
      @dayclick="calendarStore.onDayClick"
    />
  </div>
  <div class="legend">
    <div><span class="dot green"></span> Есть свободные окна</div>
    <div><span class="dot red"></span> Все окна заняты</div>
    <div><span class="dot yellow"></span> {{!adminStore.isAdmin ? 'У вас есть запись' : 'Есть записи'}}</div>
  </div>
  <div v-if="adminStore.isAdmin && calendarStore.selectedDate" class="admin-actions">
    <button
      class="admin-button"
      @click="calendarStore.disableDay"
    >
      Отключить день
    </button>
  </div>
  <MainButton
    v-if="calendarStore.selectedDate"
    :text="adminStore.isAdmin ? 'Показать слоты' : 'Продолжить'"
    @click="stepStore.goToTimeSlots"
  />
</template>

<script setup lang="ts">
import { MainButton } from 'vue-tg'
const calendarStore = useCalendarStore()
const adminStore = useAdminStore()
const stepStore = useStepStore()

</script>

<style scoped>
.appointment-scheduler {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background-color: var(--tg-theme-bg-color, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 70vh; /* Ensure the component takes the full height of the viewport */
}

.calendar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-grow: 1; /* Allow the container to grow and take available space */
}

.legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 16px;
}

.dot {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.dot.green {
  background-color: green;
}

.dot.red {
  background-color: red;
}
.dot.yellow {
  background-color: #fcc419;
}
@media (max-width: 600px) {
  .appointment-scheduler {
    padding: 16px;
    gap: 16px;
  }
}

.appointments-count {
  width: 100%;
  display: flex;
  justify-content: right;
  margin-bottom: 10px;
  margin-right: 10px;
}

.count-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.count-button:hover {
  background-color: var(--tg-theme-button-color, #2d7fcf);
}

.count {
  font-size: 24px;
  font-weight: bold;
}

.label {
  font-size: 14px;
  margin-top: 4px;
}

.admin-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.admin-button {
  padding: 10px 20px;
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.admin-button:hover {
  background-color: var(--tg-theme-button-color, #2d7fcf);
}

/* ... existing styles ... */
</style>
