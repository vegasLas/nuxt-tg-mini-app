import { isBefore, isSameDay } from 'date-fns'

export function isExpired(time: string | Date) {
	return isBefore(time, new Date())
}
