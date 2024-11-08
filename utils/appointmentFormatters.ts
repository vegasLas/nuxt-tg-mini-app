import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Appointment } from '~/types'

export const formatDateHeader = (dateStr: string) => {
  return format(parseISO(dateStr), 'd MMMM', { locale: ru })
}

export const formatTime = (dateStr: string) => {
  return format(parseISO(dateStr), 'HH:mm')
}

export const groupAppointmentsByDate = (appointments: Appointment[]) => {
  const grouped: Record<string, Appointment[]> = {}
  
  appointments.forEach(appointment => {
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

  // Convert to array of [date, appointments] pairs and sort by date
  const sortedEntries = Object.entries(grouped).sort((a, b) => 
    parseISO(a[0]).getTime() - parseISO(b[0]).getTime()
  )

  // Convert back to object
  return Object.fromEntries(sortedEntries)
} 