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
  const isPast = computed(() => selectedDate.value && selectedDate.value < startOfDay(toMoscowTime()))
  const isDisabledDay = computed(() => {
    return selectedDate.value && disabledTimeStore.isDisabledDay(selectedDate.value)
  })
  const getDotColor = (props: {
    bookedSlotsLength: number, 
    isDisabled: boolean,  
    hasAvailableSlots: boolean,
    isPast: boolean,
    slots: { bookedAppointmentId: number | null }[]
  }): string => {
    const { bookedSlotsLength, isDisabled, hasAvailableSlots, isPast } = props
    if (isDisabled) {
      if (adminStore.isAdmin) return 'gray'
      if (bookedSlotsLength > 0) return 'yellow'
      return 'gray'
    }
    if (isPast && adminStore.isAdmin) {
      return bookedSlotsLength ? 'pink' : 'blue';
    }
    if (bookedSlotsLength > 0) {
      return 'yellow'
    }
    return hasAvailableSlots ? 'green' : 'red';
  }

  const getPopoverLabel = (props: {
    bookedSlotsLength: number, 
    isDisabled: boolean,
    hasAvailableSlots: boolean,
    isPast: boolean,
    slots: { bookedAppointmentId: number | null }[]
  }): { label: string } => {
    const { bookedSlotsLength, isDisabled, hasAvailableSlots, isPast } = props
    if (isDisabled) {
      if (adminStore.isAdmin && bookedSlotsLength) {
        return { label: `Записей на этот день: ${bookedSlotsLength}. Не рабочий день` }
      }
      if (bookedSlotsLength > 0) {
        return { label: `У вас есть запись на этот день` }
      }
      return { label: 'Не рабочий день' }
    }
    if (adminStore.isAdmin) {
      if (isPast) {
        return { label: bookedSlotsLength ? `Было записей: ${bookedSlotsLength}` : 'Не было записей' };
      }
      return { label: bookedSlotsLength ? `Записей на этот день: ${bookedSlotsLength}` : 'Есть свободные окна' };
    }
    if (bookedSlotsLength > 0) {
      return { label: 'У вас есть запись на этот день' };
    }

    return { label: hasAvailableSlots ? 'Есть свободные окна' : 'Все окна заняты' };
  }

  
  const calendarAttributes = computed(() => {
    return openWindows.value.map(window => {
      const isDisabled = disabledTimeStore.isDisabledDay(window.date)
      const hasAvailableSlots = window.slots.some(slot => !slot.bookedAppointmentId)
      const bookedSlotsLength = window.slots.filter(slot => adminStore.isAdmin ? slot.bookedAppointmentId : slot.bookedAppointmentId && userStore.hasAppointment(slot.bookedAppointmentId)).length ;
      const isPast = isPastTime(window.date)
      let isBooked = false
      if (adminStore.isAdmin) {
        isBooked = window.slots.some(slot => slot.bookedAppointmentId)
      } else {
        isBooked = userStore.appointments.some(appointment => window.slots.some(slot => slot.bookedAppointmentId === appointment.id))
      }
      const data = {
        bookedSlotsLength, 
        isDisabled,
        hasAvailableSlots,
        slots: window.slots,
        isPast,
      }
      const dotColor = getDotColor(data);
      const popover = getPopoverLabel(data)
      let content = adminStore.isAdmin && isDisabled && bookedSlotsLength ? 'yellow' : undefined
      return {
        key: window.date.toDateString(),
        dot: dotColor,
        content,
        dates: window.date,
        popover
      } as Partial<CalendarAttribute>;
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
    const date = toMoscowTime(props[0].id);
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
    isDisabledDay,
    onMonthChange,
    disableDay,
    onDayClick,
    setSelectedDate,
  }
})
