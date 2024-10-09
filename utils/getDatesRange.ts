import { set, isAfter, startOfDay, addDays, endOfDay } from 'date-fns'

export function getDateRange(date: string) {
	const now = new Date()
	const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })
	const requestDate = date ? new Date(date) : now
  
	if (isAfter(now, cutoffTime) && requestDate.toDateString() === now.toDateString()) {
	  // If it's after 17:00 and the requested date is today, start from tomorrow
	  requestDate.setDate(requestDate.getDate() + 1)
	}
  
	const startDate = startOfDay(requestDate)
	const endDate = endOfDay(addDays(startDate, 30))
  
	return { startDate, endDate }
}