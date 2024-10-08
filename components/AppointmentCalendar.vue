<template>
  <div class="calendar-container">
    <VCalendar
      size="large"
      locale="ru-RU"
      :attributes="calendarStore.calendarAttributes"
      :disabled-dates="[
        {
          repeat: {
            weekdays: [1, 7],
          },
        },
      ]"
      @dayclick="onDayClick"
    />
  </div>
  <div v-if="!adminStore.isAdmin" class="legend">
    <div><span class="dot green"></span> Есть свободные окна</div>
    <div><span class="dot red"></span> Все окна заняты</div>
    <div><span class="dot yellow"></span> У вас есть запись</div>
  </div>
  <div v-if="adminStore.isAdmin && selectedDate" class="admin-actions">
    <MainButton
      text="Отключить день"
      @click="disableDay"
    />
    <MainButton
      text="Показать слоты"
      @click="stepStore.goToTimeSlots"
    />
  </div>
  <MainButton
    v-if="!adminStore.isAdmin && appointmentStore.selectedDate"
    text="Продолжить"
    @click="stepStore.goToTimeSlots"
  />
</template>

<script setup lang="ts">
import { MainButton } from 'vue-tg'

const calendarStore = useCalendarStore()
const appointmentStore = useAppointmentStore()
const adminStore = useAdminStore()
const stepStore = useStepStore()
const selectedDate = ref(null)
const onDayClick = (day: any) => {
  console.log('Day clicked:', day)
  if (adminStore.isAdmin) {
    selectedDate.value = day.date
  } else {
    appointmentStore.onDayClick(day, calendarStore.openWindows)
  }
}

const disableDay = () => {
  if (selectedDate.value) {
    adminStore.addDisabledDay(selectedDate.value)
  }
}
onMounted(async () => {
  calendarStore.fetchOpenWindows()
})
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

/* ... existing styles ... */
</style>