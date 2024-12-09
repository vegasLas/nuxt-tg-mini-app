<template>
  <div class="time-selector">
    <LoaderOverlay v-if="appointmentActionsStore.isLoading || appointmentStore.isCanceling" />
    <div>
      <h2>Доступные окна</h2>
      <div v-if="calendarStore.selectedDate" class="selected-date">
        {{ formatSelectedDate(calendarStore.selectedDate) }}
      </div>
      <div class="time-slots-grid">
        <button
          v-for="slot in availableTimeSlots.availableTimeSlots"
          :key="slot.show"
          :class="['time-slot', { 
            booked: slot.bookedAppointmentId || toMoscowTime(slot.time) <= toMoscowTime(),
            disabled: calendarStore.isDisabledDay && !userStore.hasAppointment(slot.bookedAppointmentId!),
            selected: availableTimeSlots.selectedSlot?.time === slot.time,
            'user-appointment': userStore.hasAppointment(slot.bookedAppointmentId!) || (adminStore.isAdmin && slot.bookedAppointmentId)
          }]" 
          @click="availableTimeSlots.selectTimeSlot(slot)"
          :disabled="isDisabled(slot)"
        >
          <span v-if="userStore.hasAppointment(slot.bookedAppointmentId!) || (adminStore.isAdmin && slot.bookedAppointmentId)" class="checkmark">✓</span>
          <span class="time-icon">&#128339;</span> {{ slot.show }}
        </button>
      </div>
      <div v-if="adminStore.isAdmin && availableTimeSlots.selectedSlot && availableTimeSlots.selectedSlot.bookedAppointmentId" class="admin-actions">
        <button @click="adminStore.showDetails" class="native-button details-button">Показать детали</button>
      </div>
      <BackButton @click="appointmentActionsStore.closeTimeSlots()" />
      <MainButton
        v-if="availableTimeSlots.selectedSlot && !appointmentActionsStore.isLoading && !availableTimeSlots.isPast"
        :text="appointmentActionsStore.getMainButtonText"
        @click="appointmentActionsStore.handleMainButtonClick()"
        :disabled="!availableTimeSlots.selectedSlot"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MainButton, BackButton } from 'vue-tg'
const appointmentActionsStore = useAppointmentActionsStore()
const appointmentStore = useAppointmentStore()
const availableTimeSlots = useAvailableTimeSlots()
const calendarStore = useCalendarStore()
const userStore = useUserStore()
const adminStore = useAdminStore()
function isDisabled(slot: { bookedAppointmentId: number | null }) {
  const isPast = isPastTime(calendarStore.selectedDate!)
  if (slot.bookedAppointmentId! < 1 && !calendarStore.isDisabledDay && !isPast) return false
  else if (slot.bookedAppointmentId! && adminStore.isAdmin) return false
  const userHasNotAppointment = !userStore.hasAppointment(slot.bookedAppointmentId!)
  if (calendarStore.isDisabledDay) {
    if (adminStore.isAdmin) return false
    if (userHasNotAppointment) return true
  } 
  if (userHasNotAppointment) return true
  return false
}
onMounted(() => {
  if (adminStore.isAdmin && calendarStore.selectedDate) {
    adminStore.fetchAppointmentsByDate(calendarStore.selectedDate)
  }
})
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
  margin-bottom: 1rem;
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
.time-slot:disabled,
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

/* Update styles for the loader overlay and container */
.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  height: 100%;
  width: 100%;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.admin-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 0.1rem;
}

.native-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
}

.details-button {
  background-color: #4263eb;
  color: #fff;
}

.details-button:hover {
  background-color: #3b5bdb;
}
</style>
