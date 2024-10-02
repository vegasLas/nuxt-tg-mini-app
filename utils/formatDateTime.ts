export function formatDateTime(dateTime: string) {
	const date = new Date(dateTime)
	return date.toLocaleString('ru-RU', {
	  year: 'numeric',
	  month: 'long',
	  day: 'numeric',
	  hour: '2-digit',
	  minute: '2-digit'
	})
  }