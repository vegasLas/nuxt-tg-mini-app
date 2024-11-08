<template>
  <div class="appointments-list">
    <h2 class="appointments-list-title">Мои записи</h2>
    <div v-if="userStore.appointments.length === 0" class="no-appointments">
      У вас нет запланированных записей.
    </div>
    <div v-else class="appointments-by-date">
      <div v-for="(appointmentGroup, date) in groupedAppointments" 
           :key="date" 
           class="date-group">
        <h3 class="date-header">{{ formatDateHeader(date as string) }}</h3>
        <ul>
          <li v-for="appointment in appointmentGroup" 
              :key="appointment.id" 
              class="appointment-item">
            <div class="appointment-info">
              <div class="time">
                <span style="margin-right: 0.5rem;">&#128339;</span>
                {{ formatTime(appointment.time) }}
              </div>
            </div>
            <div class="appointment-actions">
              <template v-if="!isExpired(appointment.time)">
                <button 
                  @click="() => userStore.handleCancelAppointment(appointment.id)"
                  class="action-button remove"
                  :disabled="appointmentStore.isCanceling"
                >
                  Отменить
                </button>
              </template>
              <template v-else>
                <div class="expired-status">Прошла</div>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="userStore.hasMoreAppointments" class="load-more">
      <button 
        @click="userStore.loadMoreAppointments" 
        class="load-more-button" 
        :disabled="appointmentStore.isCanceling"
      >
        Загрузить еще
      </button>
    </div>
    <div class="pagination-info">
      Страница {{ userStore.currentPage }} из {{ userStore.totalPages }}
      (Всего записей: {{ userStore.totalItems }})
    </div>
    <BackButton @click="stepStore.goToCalendar()" />
    <LoaderOverlay v-if="appointmentStore.isCanceling" />
  </div>
</template>

<script setup lang="ts">
import { BackButton } from 'vue-tg'

const stepStore = useStepStore()
const userStore = useUserStore()
const appointmentStore = useAppointmentStore()

const groupedAppointments = computed(() => {
  return groupAppointmentsByDate(userStore.appointments)
})
</script>

<style scoped>
.appointments-list {
  width: 95%;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.appointments-list-title {
  margin: 0;
  color: black;
  padding: 0;
}

.no-appointments {
  text-align: center;
  color: var(--tg-theme-hint-color, #999999);
  padding: 20px;
}

.appointments-by-date {
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.date-group {
  margin-bottom: 20px;
}

.date-header {
  background-color: var(--tg-theme-secondary-bg-color, #f5f5f5);
  padding: 5px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  color: var(--tg-theme-text-color, #000000);
  font-weight: bold;
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #cccccc);
  margin-bottom: 8px;
}

.appointment-info {
  flex-grow: 1;
  display: flex;
  gap: 5px;
}

.time {
  font-weight: bold;
  color: black;
}

.appointment-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove {
  background-color: #ff4d4f;
  color: #ffffff;
}

.expired-status {
  color: #999999;
  font-style: italic;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.load-more-button {
  padding: 8px 16px;
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.pagination-info {
  text-align: center;
  margin-top: 10px;
  color: var(--tg-theme-hint-color, #999999);
  font-size: 14px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
