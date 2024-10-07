<template>
  <div class="appointments-list">
    <h2 style="color: #000000;">Мои записи</h2>
    <div v-if="userStore.appointments.length === 0" class="no-appointments">
      У вас нет запланированных записей.
    </div>
    <ul v-else>
      <li v-for="appointment in userStore.appointments" :key="appointment.id" class="appointment-item">
        <div class="appointment-info">
          <div class="date-time" :class="{ 'expired': userStore.isExpired(appointment.time) }">
            {{ userStore.formatDateTime(new Date(appointment.time)) }}
          </div>
        </div>
        <div class="appointment-actions" :class="{ 'expired': userStore.isExpired(appointment.time) }">
          <template v-if="!userStore.isExpired(appointment.time)">
            <button @click="userStore.rescheduleAppointment(appointment)" class="action-button reschedule">
              Перенести
            </button>
            <button @click="() => userStore.handleCancel(appointment.time)" class="action-button remove">
              Отменить
            </button>
          </template>
          <template v-else>
            <div class="expired-status">Прошла</div>
          </template>
        </div>
      </li>
    </ul>
    <div v-if="userStore.isLoading" class="loading">Загрузка...</div>
    <div v-if="userStore.hasMoreAppointments" class="load-more">
      <button @click="userStore.loadMoreAppointments" class="load-more-button" :disabled="userStore.isLoading">
        Загрузить еще
      </button>
    </div>
    <div class="pagination-info">
      Страница {{ userStore.currentPage }} из {{ userStore.totalPages }}
      (Всего записей: {{ userStore.totalItems }})
    </div>
    <BackButton @click="useAppointmentStore().hideAppointmentsList" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { BackButton } from 'vue-tg'
import { useUserStore } from '~/stores/useUserStore'
import { useAppointmentStore } from '~/stores/useAppointmentStore'

const userStore = useUserStore()

onMounted(async () => {
  await userStore.fetchUserAppointments()
})
</script>

<style scoped>
.appointments-list {
  width: 90%;
  height: 70vh;
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
  overflow-y: auto; /* Enable vertical scrolling */
  flex-grow: 1; /* Allow the ul to grow and take available space */
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
  width: 100px; /* Set a fixed width for consistency */
}

.appointment-actions.expired {
  justify-content: center;
  height: 66px; /* Adjust this value to match the height of two buttons plus gap */
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.reschedule {
  background-color: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
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