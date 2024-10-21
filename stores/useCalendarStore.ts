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
  const getDotColor = (date: Date, hasUserAppointment: boolean, slots: { bookedAppointmentId: number | null }[]): string => {
    const isPast = date < new Date();
    const hasBookedSlots = slots.some(slot => slot.bookedAppointmentId);

    if (isPast) {
      return hasBookedSlots ? 'pink' : 'blue';
    }
    if (hasUserAppointment) return 'yellow';
    return slots.some(slot => !slot.bookedAppointmentId) ? 'green' : 'red';
  }

  const getPopoverLabel = (date: Date, hasUserAppointment: boolean, slots: { bookedAppointmentId: number | null }[]): { label: string } => {
    const isPast = date < new Date();
    const hasBookedSlots = slots.some(slot => slot.bookedAppointmentId);

    if (isPast) {
      return { label: hasBookedSlots ? 'Были записи' : 'Не было записей' };
    }
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
      let isBooked = false
      if (adminStore.isAdmin) {
        isBooked = window.slots.some(slot => slot.bookedAppointmentId)
      } else {
        isBooked = userStore.appointments.some(appointment => window.slots.some(slot => slot.bookedAppointmentId === appointment.id))
      }
      const dotColor = getDotColor(window.date, isBooked, window.slots);

      return {
        dot: dotColor,
        dates: window.date,
        popover: getPopoverLabel(window.date, isBooked, window.slots)
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
  function onMonthChange(props: { id: string }[]) {
    console.log('onMonthChange', props)
    const date = new Date(props[0].id);
    const isExistingOpenWindow = openWindows.value.some(({date: windowDate}) => 
      date.getMonth() === windowDate.getMonth() && 
      date.getFullYear() === windowDate.getFullYear()
    );
    if (adminStore.isAdmin && !isExistingOpenWindow) {
      bookedAppointmentsStore.fetchOpenWindowsForAdmin(date);
    }
  }

  return {
    calendarAttributes,
    selectedDate,
    onMonthChange,
    disableDay,
    onDayClick,
    setSelectedDate,
  }
})
