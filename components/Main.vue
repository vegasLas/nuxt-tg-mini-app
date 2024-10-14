<template>
	<ClientOnly>
		<div class="appointment-scheduler">
			<div class="appointments-count">
			<button class="count-button" @click="stepStore.showAppointmentsList">
				<span class="label">Мои записи</span>
				<span class="count">{{ userStore.appointments.filter(appointment => new Date(appointment.time) >= new Date()).length }}</span>
			</button>
			</div>

			<template v-if="stepStore.currentStep === 'calendar'">
				<AppointmentCalendar />
			</template>

			<template v-else-if="stepStore.currentStep === 'timeSlots'">
				<AvailableTimeSlots />
			</template>
			
			<template v-else-if="stepStore.currentStep === 'userInfo'">
				<UserInfoForm @back="stepStore.goToTimeSlots" />
			</template>

			<template v-else-if="stepStore.currentStep === 'appointmentsList'">
				<AppointmentsList />
			</template>
		</div>
	</ClientOnly>
  </template>
  
  <script setup lang="ts">
  const userStore = useUserStore()
  const adminStore = useAdminStore()
  const stepStore = useStepStore()
  onMounted(async () => {
    await adminStore.checkAuth()
    await userStore.fetchAppointments()
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
}</style>