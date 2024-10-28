<template>
  <div class="appointments-list">
    <h2 class="appointments-list-title">Все записи</h2>
    <!-- <div v-if="adminStore.isLoading" class="loading">
      Загрузка...
    </div> -->
    <div v-if="adminStore.appointments.length === 0" class="no-appointments">
      Нет запланированных записей.
    </div>
    <div v-else class="appointments-by-date">
      <div v-for="(appointmentGroup, date) in groupedAppointments" 
           :key="date" 
           class="date-group">
        <h3 class="date-header">{{ formatDateHeader(date) }}</h3>
        <ul>
          <li v-for="appointment in appointmentGroup" 
              :key="appointment.id" 
              class="appointment-item">
            <div class="appointment-info">
              <div class="time">{{ formatTime(appointment.time) }}</div>
              <div class="client-info">
                <div class="name">{{ appointment.name }}</div>
                <div class="phone">{{ appointment.phoneNumber }}</div>
                <div v-if="appointment.comment" class="comment">
                  {{ appointment.comment }}
                </div>
              </div>
            </div>
            <div class="appointment-actions">
              <button 
                @click="() => adminStore.handleCancelAppointment(appointment.id)"
                class="action-button remove"
                :disabled="adminStore.isCanceling"
              >
                Отменить
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <BackButton @click="stepStore.goToCalendar()" />
    <LoaderOverlay v-if="adminStore.isCanceling || adminStore.isLoading" />
  </div>
</template>

<script setup lang="ts">
import { format, parseISO, startOfDay, addDays, endOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { BackButton } from 'vue-tg'

const stepStore = useStepStore()
const adminStore = useAdminStore()
onMounted(async () => {
  const today = startOfDay(new Date())
  const startDate = startOfDay(today)
  const endDate = endOfDay(addDays(today, 30))
  // Fetch appointments for all dates
  adminStore.fetchAppointmentsByDateRange(startDate, endDate)
})

const groupedAppointments = computed(() => {
  const grouped: Record<string, any[]> = {}
  adminStore.appointments.forEach(appointment => {
    if (isPastTime(parseISO(appointment.time))) return
    const date = format(parseISO(appointment.time), 'yyyy-MM-dd')
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(appointment)
  })

  // Sort appointments within each date group by time
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => 
      parseISO(a.time).getTime() - parseISO(b.time).getTime()
    )
  })

  return grouped
})

const formatDateHeader = (dateStr: string) => {
  return format(parseISO(dateStr), 'd MMMM', { locale: ru })
}

const formatTime = (dateStr: string) => {
  return format(parseISO(dateStr), 'HH:mm')
}
</script>

<style scoped>
.appointments-list {
  width: 90%;
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

.loading, .no-appointments {
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
  padding: 5px 10px ;
  border-radius: 8px;
  margin-bottom: 10px;
  color: var(--tg-theme-text-color, #000000);
  font-weight: bold;
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #cccccc);
  margin-bottom: 8px;
}

.appointment-info {
  flex-grow: 1;
  display: flex;
  gap: 15px;
}

.time {
  font-weight: bold;
  min-width: 60px;
  color: black
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  color: black;
  font-weight: 500;
}

.phone {
  color: black;
  font-size: 0.9em;
}

.comment {
  font-size: 0.9em;
  color: black;
  font-style: italic;
}

.appointment-actions {
  display: flex;
  align-items: center;
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

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
