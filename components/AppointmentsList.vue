<template>
  <div class="appointments-list">
    <h2 style="color: #000000;">Мои записи</h2>
    <div v-if="userStore.appointments.length === 0" class="no-appointments">
      У вас нет запланированных записей.
    </div>
    <ul v-else>
      <li v-for="appointment in userStore.appointments" :key="appointment.id" class="appointment-item">
        <div class="appointment-info">
          <div class="date-time" :class="{ 'expired': isExpired(appointment.time) }">
            {{ formatDateTime(new Date(appointment.time)) }}
          </div>
        </div>
        <div class="appointment-actions" :class="{ 'expired': isExpired(appointment.time) }">
          <template v-if="!isExpired(appointment.time)">
            <button @click="() => userStore.handleCancelAppointment(appointment.id)" class="action-button remove">
              Отменить
            </button>
          </template>
          <template v-else>
            <div class="expired-status">Прошла</div>
          </template>
        </div>
      </li>
    </ul>
    <div v-if="userStore.hasMoreAppointments" class="load-more">
      <button @click="userStore.loadMoreAppointments" class="load-more-button" :disabled="appointmentStore.isCanceling">
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

</script>

<style scoped>
.appointments-list {
  width: 90%;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 10px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 10px;
  color: var(--tg-theme-text-color, #000000);
}

.no-appointments {
  color: var(--tg-theme-hint-color, #999999);
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
  background-color: #ffffff;
  border-radius: 8px;
  height: 50vh; /* Fixed height, adjust as needed */
  overflow-y: auto; /* Enable vertical scrolling */
  margin-bottom: 10px; /* Add some space before the BackButton */
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #cccccc);
  color: #000000;
}

.appointment-item:last-child {
  border-bottom: none;
}

.appointment-info {
  flex-grow: 1;
}

.date-time {
  font-weight: bold;
  margin-bottom: 5px;
  color: #000000;
}

.service {
  color: #666666;
}

.appointment-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100px; /* Reduced width since we only have one button now */
}

.appointment-actions.expired {
  justify-content: center;
  height: 33px; /* Adjusted height for a single button */
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.remove {
  background-color: #ff4d4f;
  color: #ffffff;
}

.close-button {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
  color: var(--tg-theme-text-color, #000000);
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* BackButton styles */
:deep(.back-button) {
  margin-top: auto; /* Push the BackButton to the bottom */
}

.date-time.expired {
  color: #999999;
}

/* Remove the .expired-placeholder class */

.loading {
  text-align: center;
  margin-top: 10px;
  color: var(--tg-theme-hint-color, #999999);
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

.load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  text-align: center;
  margin-top: 10px;
  color: var(--tg-theme-hint-color, #999999);
  font-size: 14px;
}

.expired-status {
  color: #999999;
  text-align: center;
  font-style: italic;
}
</style>
