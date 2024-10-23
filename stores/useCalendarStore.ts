import type { CalendarAttribute } from '~/types'
import { startOfDay } from 'date-fns'
export const useCalendarStore = defineStore('calendar', () => {
  const userStore = useUserStore()
  const adminStore = useAdminStore()
  const bookedAppointmentsStore = useBookedAppointmentsStore()
  const selectedDate = ref<Date | null>(null)
  const openWindowsStore = useOpenWindowsStore()
  const disabledTimeStore = useDisabledTimeStore()
  const { openWindows } = storeToRefs(openWindowsStore)
  const isPast = computed(() => selectedDate.value && selectedDate.value < startOfDay(new Date()))

  const getDotColor = (date: Date, hasUserAppointment: boolean, slots: { bookedAppointmentId: number | null }[]): string => {
    const isPast = date < startOfDay(new Date());
    const hasBookedSlots = slots.some(slot => slot.bookedAppointmentId);
    if (disabledTimeStore.isDisabledDay(date)) {
      return 'gray'
    }
    if (isPast && adminStore.isAdmin) {
      return hasBookedSlots ? 'pink' : 'blue';
    }
    if (hasUserAppointment) return 'yellow';
    return slots.some(slot => !slot.bookedAppointmentId) ? 'green' : 'red';
  }

  const getPopoverLabel = (date: Date, hasUserAppointment: boolean, slots: { bookedAppointmentId: number | null }[]): { label: string } => {
    const isPast = date < startOfDay(new Date());
    const hasBookedSlots = slots.some(slot => slot.bookedAppointmentId);
    const hasAvailableSlots = slots.some(slot => !slot.bookedAppointmentId);

    if (adminStore.isAdmin) {
      if (isPast) {
        return { label: hasBookedSlots ? 'Были записи' : 'Не было записей' };
      }
      return { label: hasBookedSlots ? 'Есть записи на этот день' : 'Есть свободные окна' };
    }
    if (disabledTimeStore.isDisabledDay(date)) {
      return { label: 'Не рабочий день' };
    }
    if (hasUserAppointment) {
      return { label: 'У вас есть запись на этот день' };
    }

    return { label: hasAvailableSlots ? 'Есть свободные окна' : 'Все окна заняты' };
  }
  const calendarAttributes = computed<CalendarAttribute[]>(() => {
    console.log('openWindows', openWindows.value)
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
      disabledTimeStore.handleDay(selectedDate.value)
    }
  }

  function setSelectedDate(date: Date | null) {
    selectedDate.value = date
  }
  function onMonthChange(props: { id: string }[]) {
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
    isPast,
    onMonthChange,
    disableDay,
    onDayClick,
    setSelectedDate,
  }
})
