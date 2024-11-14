import type { CalendarAttribute } from '~/types'
import { startOfDay } from 'date-fns'

interface DayProperties {
  bookedSlotsLength: number
  isDisabled: boolean
  hasAvailableSlots: boolean
  isPast: boolean
  slots: { bookedAppointmentId: number | null }[]
}

// Calendar display constants
const CALENDAR_COLORS = {
  DISABLED: 'gray',
  BOOKED: 'yellow',
  PAST_WITH_BOOKINGS: 'pink',
  PAST_WITHOUT_BOOKINGS: 'blue',
  AVAILABLE: 'green',
  UNAVAILABLE: 'red',
} as const

export const useCalendarStore = defineStore('calendar', () => {
  const userStore = useUserStore()
  const adminStore = useAdminStore()
  const bookedAppointmentsStore = useBookedAppointmentsStore()
  const openWindowsStore = useOpenWindowsStore()
  const disabledTimeStore = useDisabledTimeStore()
  
  const selectedDate = ref<Date | null>(null)
  const currentMonth = ref<Date>(startOfDay(toMoscowTime()))
  const { openWindows } = storeToRefs(openWindowsStore)

  const isPast = computed(() => 
    selectedDate.value && selectedDate.value < startOfDay(toMoscowTime())
  )

  const isDisabledDay = computed(() => 
    selectedDate.value && disabledTimeStore.isDisabledDay(selectedDate.value)
  )

  function getDotColor({ bookedSlotsLength, isDisabled, hasAvailableSlots, isPast }: DayProperties): string {
    if (isDisabled) {
      if (adminStore.isAdmin) return CALENDAR_COLORS.DISABLED
      return bookedSlotsLength > 0 ? CALENDAR_COLORS.BOOKED : CALENDAR_COLORS.DISABLED
    }

    if (isPast && adminStore.isAdmin) {
      return bookedSlotsLength ? CALENDAR_COLORS.PAST_WITH_BOOKINGS : CALENDAR_COLORS.PAST_WITHOUT_BOOKINGS
    }

    if (bookedSlotsLength > 0) {
      return CALENDAR_COLORS.BOOKED
    }

    return hasAvailableSlots ? CALENDAR_COLORS.AVAILABLE : CALENDAR_COLORS.UNAVAILABLE
  }

  function getPopoverLabel({ bookedSlotsLength, isDisabled, hasAvailableSlots, isPast }: DayProperties): { label: string } {
    if (isDisabled) {
      if (adminStore.isAdmin && bookedSlotsLength) {
        return { label: `Записей на этот день: ${bookedSlotsLength}. Не рабочий день` }
      }
      return bookedSlotsLength > 0 
        ? { label: 'У вас есть запись на этот день' }
        : { label: 'Не рабочий день' }
    }

    if (adminStore.isAdmin) {
      if (isPast) {
        return { label: bookedSlotsLength ? `Было записей: ${bookedSlotsLength}` : 'Не было записей' }
      }
      return { label: bookedSlotsLength ? `Записей на этот день: ${bookedSlotsLength}` : 'Есть свободные окна' }
    }

    if (bookedSlotsLength > 0) {
      return { label: 'У вас есть запись на этот день' }
    }

    return { label: hasAvailableSlots ? 'Есть свободные окна' : 'Все окна заняты' }
  }

  function getWindowProperties(window: { date: Date, slots: { bookedAppointmentId: number | null }[] }): DayProperties {
    const isDisabled = disabledTimeStore.isDisabledDay(window.date)
    const hasAvailableSlots = window.slots.some(slot => !slot.bookedAppointmentId)
    const bookedSlotsLength = window.slots.filter(slot => 
      adminStore.isAdmin 
        ? slot.bookedAppointmentId 
        : slot.bookedAppointmentId && userStore.hasAppointment(slot.bookedAppointmentId)
    ).length
    
    return {
      bookedSlotsLength,
      isDisabled,
      hasAvailableSlots,
      slots: window.slots,
      isPast: isPastTime(window.date),
    }
  }

  const calendarAttributes = computed(() => {
    const currentMonthWindows = openWindows.value.filter(window => 
      window.date.getMonth() === currentMonth.value.getMonth() && 
      window.date.getFullYear() === currentMonth.value.getFullYear()
    )

    const calendarAttributes = currentMonthWindows.map(window => {
      const properties = getWindowProperties(window)
      const dotColor = getDotColor(properties)
      const popover = getPopoverLabel(properties)
      const content = adminStore.isAdmin && properties.isDisabled && properties.bookedSlotsLength 
        ? CALENDAR_COLORS.BOOKED 
        : undefined

      return {
        key: window.date.toDateString(),
        dot: dotColor,
        content,
        dates: window.date,
        popover,
      } as Partial<CalendarAttribute>
    })
    return calendarAttributes
  })

  function onDayClick(day: { date: Date }) {
    if (adminStore.isAdmin) {
      selectedDate.value = day.date
      return
    }

    const openWindow = openWindows.value.find(window => 
      window.date.toDateString() === day.date.toDateString()
    )
    selectedDate.value = openWindow ? day.date : null
  }

  function onMonthChange(props: { id: string }[]) {
    const date = toMoscowTime(props[0].id)
    currentMonth.value = date
    
    const isExistingOpenWindow = openWindows.value.some(({date: windowDate}) => 
      date.getMonth() === windowDate.getMonth() && 
      date.getFullYear() === windowDate.getFullYear()
    )
    
    if (adminStore.isAdmin && !isExistingOpenWindow) {
      bookedAppointmentsStore.fetchOpenWindowsForAdmin(date)
    }
  }

  return {
    calendarAttributes,
    selectedDate,
    isPast,
    isDisabledDay,
    currentMonth,
    onMonthChange,
    disableDay: () => selectedDate.value && disabledTimeStore.handleDay(selectedDate.value),
    onDayClick,
    setSelectedDate: (date: Date | null) => selectedDate.value = date,
  }
})
