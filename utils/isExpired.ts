import { isBefore } from 'date-fns'

export function isExpired(time: string | Date) {
	return isBefore(time, toMoscowTime())
}
