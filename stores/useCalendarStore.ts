import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CalendarAttribute } from '~/types'
import { 
  addDays, 
  isAfter, 
  set, 
  isSameDay,
  parseISO,
} from 'date-fns'

export const useCalendarStore = defineStore('calendar', () => {
  const openWindows = ref<{ date: Date; slots: { show: string; time: Date, booked: boolean }[] }[]>([])
  const userStore = useUserStore()
  const adminStore = useAdminStore()
  const bookedAppointmentsStore = useBookedAppointmentsStore()
  const selectedDate = ref<Date | null>(null)

  const calendarAttributes = computed<CalendarAttribute[]>(() => {
    
    return openWindows.value.map(window => {
      const hasUserAppointment = userStore.appointments.some(appointment => 
        isSameDay(parseISO(appointment.time), window.date)
      );

      const dotColor = hasUserAppointment 
        ? 'yellow' 
        : window.slots.some(slot => !slot.booked) 
          ? 'green' 
          : 'red';

      return {
        dot: dotColor,
        dates: window.date,
        popover: {
          label: hasUserAppointment 
            ? 'У вас есть запись на этот день'
            : window.slots.some(slot => !slot.booked) 
              ? 'Есть свободные окна' 
              : 'Все окна заняты'
        }
      };
    });
  });

  async function fetchOpenWindows() {
    await bookedAppointmentsStore.fetchBookedAppointments()
    if (bookedAppointmentsStore.isErrorFetchingBookedAppointments) {
      console.error(bookedAppointmentsStore.isErrorFetchingBookedAppointments)
      return
    }

    const now = new Date()
    const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })
    const startDate = isAfter(now, cutoffTime) ? addDays(now, 1) : now
    const endDate = addDays(startDate, 30)

    openWindows.value = bookedAppointmentsStore.getOpenWindows(startDate, endDate)
  }

  function onDayClick(day: { date: Date }) {
    if (adminStore.isAdmin) {
      selectedDate.value = day.date;
      return;
    }

    const openWindow = openWindows.value.find(window => 
      window.date.toDateString() === day.date.toDateString()
    );

    selectedDate.value = openWindow ? day.date : null;
  }
  
  function disableDay() {
    if (selectedDate.value) {
      adminStore.addDisabledDay(selectedDate.value.toString())
    }
  }

  function setSelectedDate(date: Date | null) {
    selectedDate.value = date
  }

  onMounted(() => {
    fetchOpenWindows()
  })

  return {
    openWindows,
    calendarAttributes,
    selectedDate,
    disableDay,
    onDayClick,
    setSelectedDate,
    fetchOpenWindows
  }
})
