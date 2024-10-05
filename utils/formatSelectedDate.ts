export const formatSelectedDate = (date: Date) => {
	return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })
  }