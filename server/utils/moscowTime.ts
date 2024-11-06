import { parseISO } from 'date-fns'

export function parseToMoscowTime(dateString: string): Date {
  const parsedDate = parseISO(dateString)
  return new Date(parsedDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
} 