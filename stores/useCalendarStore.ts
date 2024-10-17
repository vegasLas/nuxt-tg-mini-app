import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWebApp } from 'vue-tg'
import type { CalendarAttribute } from '~/types'
import { 
  addDays, 
  startOfDay, 
  isAfter, 
  set, 
  isSameDay,
  getDay, 
  setHours, 
  format,
  parseISO,
} from 'date-fns'

export const useCalendarStore = defineStore('calendar', () => {
  const openWindows = ref<{ date: Date; slots: { show: string; time: Date, booked: boolean }[] }[]>([])
  const userStore = useUserStore()
  const disabledDaysStore = useDisabledTimeStore()
  const loading = ref(false)
  const error = ref<string | null>(null)
  const adminStore = useAdminStore()
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
    loading.value = true;
    error.value = null;

    try {
      await disabledDaysStore.fetchDisabledDays();
      const response = await useFetch('/api/appointments/booked', {
        headers: {
          'x-init-data': useWebApp().initData
        }
      });

      if (response.status.value === 'error') {
        throw new Error('Failed to fetch booked appointments');
      }

      const bookedAppointments = response.data.value as unknown as { time: string }[];
      const workDays = [1, 2, 3, 4, 5]; // Monday to Friday
      const workHours = Array.from({ length: 9 }, (_, i) => {
        const hour = 9 + i;
        return {
          show: format(setHours(new Date(), hour), 'HH:00'),
          time: setHours(new Date(), hour),
          booked: false
        };
      });

      const openWindowsMap: { [key: string]: { date: Date; slots: { show: string; time: Date; booked: boolean }[] } } = {};
      const now = new Date();
      const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 });
      const startDate = isAfter(now, cutoffTime) ? addDays(now, 1) : now;
      const endDate = addDays(startDate, 30);

      // Create initial open windows for all work days, excluding disabled days
      
      for (let d = startOfDay(startDate); d <= endDate; d = addDays(d, 1)) {
        if (workDays.includes(getDay(d)) && !isDisabledDay(d)) {
          // Skip today if it's after 17:00
          if (isSameDay(d, now) && now > cutoffTime) {
            continue;
          }

          const dateString = format(d, 'dd-MM-yyyy');
          openWindowsMap[dateString] = {
            date: d,
            slots: workHours.map(({ show, time }) => ({
              show,
              time: set(d, { hours: time.getHours(), minutes: 0, seconds: 0, milliseconds: 0 }),
              booked: bookedAppointments.some(appointment => isSameDay(parseISO(appointment.time), d) && parseISO(appointment.time).getHours() === time.getHours())
            }))
          };
        }
      }
      openWindows.value = Object.values(openWindowsMap);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  }



  // Helper function to check if a day is disabled
  function isDisabledDay(date: Date): boolean {
    return disabledDaysStore.disabledDays.some(disabledDay => 
      isSameDay(date, parseISO(disabledDay.date))
    )
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
    loading,
    error,
    selectedDate,
    disableDay,
    onDayClick,
    setSelectedDate,
    fetchOpenWindows
  }
})