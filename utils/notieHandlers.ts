import notie from 'notie'

type NotieType = 'success' | 'error' | 'warning' | 'info'

export const showNotification = (type: NotieType, message: string) => {
  notie.alert({
    type: type,
    text: message,
    time: 2,
    position: 'bottom'
  })
}
