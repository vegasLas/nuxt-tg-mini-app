import { isSameDay, set } from 'date-fns'

export function isPastTime (date: Date) {
	return isSameDay(date, toMoscowTime()) && date < set(toMoscowTime(), { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 }) ? false : date < toMoscowTime()
}
