import type { CalendarAttribute } from '~/types'
import { 
  isSameDay,
  parseISO,
} from 'date-fns'

export const useCalendarStore = defineStore('calendar', () => {
  const userStore = useUserStore()
  const adminStore = useAdminStore()
  const bookedAppointmentsStore = useBookedAppointmentsStore()
  const selectedDate = ref<Date | null>(null)
  const { openWindows } = storeToRefs(bookedAppointmentsStore)
  const getDotColor = (hasUserAppointment: boolean, slots: { bookedAppointmentId: number | null }[]): string => {
    if (adminStore.isAdmin) {
      return slots.some(slot => slot.bookedAppointmentId) ? 'yellow' : 'green';
    }
    if (hasUserAppointment) return 'yellow';
    return slots.some(slot => !slot.bookedAppointmentId) ? 'green' : 'red';
  }

  const getPopoverLabel = (hasUserAppointment: boolean, slots: { bookedAppointmentId: number | null }[]): { label: string } => {
    return {
      label: hasUserAppointment 
        ? 'У вас есть запись на этот день'
        : slots.some(slot => !slot.bookedAppointmentId) 
          ? 'Есть свободные окна' 
          : 'Все окна заняты'
    };
  }
  const calendarAttributes = computed<CalendarAttribute[]>(() => {
    return openWindows.value.map(window => {
      const hasUserAppointment = userStore.appointments.some(appointment => 
        isSameDay(parseISO(appointment.time), window.date)
      );

      const dotColor = getDotColor(hasUserAppointment, window.slots);

      return {
        dot: dotColor,
        dates: window.date,
        popover: getPopoverLabel(hasUserAppointment, window.slots)
      };
    });
  });

  

  

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
    bookedAppointmentsStore.fetchOpenWindows()
  })

  return {
    calendarAttributes,
    selectedDate,
    disableDay,
    onDayClick,
    setSelectedDate,
  }
})
