import { parseISO } from 'date-fns'

export function toMoscowTime(date: Date | string = new Date()) {
  return new Date((typeof date === 'string' ? parseISO(date) : date).toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
}

