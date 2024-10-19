import notie from 'notie'

type NotieType = 'success' | 'error' | 'warning' | 'info'

export const showNotification = (data: {type: NotieType, message: string, time?: number, position?: 'top' | 'bottom' }) => {
  notie.alert({
    type: data.type,
    text: data.message,
    time: data.time || 1,
    position: data.position || 'bottom'
  })
}
