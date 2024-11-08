import { useWebAppPopup } from 'vue-tg'
import type { Appointment } from '~/types'
import { cancelAppointment, submitAppointment, updateAppointment } from '~/api/appointments'
import { format } from 'date-fns'

export const useAppointmentStore = defineStore('appointment', () => {
  const isCanceling = ref(false)
  const bookedAppointmentsStore = useBookedAppointmentsStore()

  async function removeAppointment(id: number) {
    try {
      await cancelAppointment(id)
      bookedAppointmentsStore.removeAppointment(id)
      return true
    } catch (error) {
      console.error('Произошла ошибка при отмене записи:', error)
      return false
    }
  }

  async function handleCancelAppointment(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      const { showPopup, onPopupClosed } = useWebAppPopup()
      const popupClosed = onPopupClosed(async (e: { button_id: string }) => {
        if (e.button_id !== 'cancelAppointment') {
          resolve(false)
          popupClosed.off()
          return
        }
        isCanceling.value = true
        try {
          const result = await removeAppointment(id)
          if (result) {
            showNotification({type: 'success', message: 'Запись успешно отменена'})
            resolve(true)
          } else {
            throw new Error('Произошла ошибка при отмене записи')
          }
        } catch (error) { 
          showNotification({type: 'error', message: 'Произошла ошибка при отмене записи'})
          console.error('Произошла ошибка при отмене записи:', error)
          resolve(false)
        } finally {
          isCanceling.value = false
          popupClosed.off()
        }
      }, { manual: true })
      showPopup({
        title: 'Отмена записи',
        message: 'Хотите отменить запись?',
        buttons: [
          { text: 'Закрыть', type: 'destructive' },
          { id: 'cancelAppointment', type: 'default', text: 'Отменить запись' },
        ],
      })
    })
  }

  async function submitAppointmentData(appointmentData: {
    name: string,
    phoneNumber: string,
    time: Date,
    comment: string
  }): Promise<Appointment | null> {
    try {
      const response = await submitAppointment(appointmentData)
      await bookedAppointmentsStore.fetchOpenWindows()
      showNotification({type: 'success', message: 'Запись прошла успешно'})
      return response
    } catch (error) {
      console.error('Ошибка при создании записи:', error)
      showNotification({type: 'error', message: 'Не удалось создать запись. Попробуйте позже.'})
      return null
    }
  }

  async function updateAppointmentData(id: number, updateData: Partial<Omit<Appointment, 'id' | 'user'>>): Promise<Appointment | null> {
    try {
      const updatedAppointment = await updateAppointment(id, updateData)
      showNotification({type: 'success', message: 'Запись успешно обновлена'})
      return updatedAppointment
    } catch (error: any) {
      console.error('Error updating appointment:', error)
      if (error.statusCode === 409) {
        showNotification({type: 'error', message: 'На это время уже есть запись. Пожалуйста, выберите другое время.'})
      } else if(error.statusCode === 403) {
        showNotification({type: 'error', message: 'У вас уже есть 2 активных записи. Пожалуйста, отмените одну из них, прежде чем создавать новую.'})
      } else {
        showNotification({type: 'error', message: 'Не удалось обновить запись. Попробуйте позже.'})
      }
      return null
    }
  }

  async function rescheduleAppointment(oldAppointment: Appointment, newTime: Date): Promise<Appointment | null> {
    try {
      const updatedAppointment = await updateAppointment(oldAppointment.id, { time: format(newTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") })
      bookedAppointmentsStore.rescheduleAppointment(
        { time: oldAppointment.time, id: oldAppointment.id },
        { newTime: format(newTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), id: updatedAppointment.id }
      )
      showNotification({type: 'success', message: 'Запись успешно перенесена'})
      return updatedAppointment
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      showNotification({type: 'error', message: 'Не удалось перенести запись. Попробуйте позже.'})
      return null
    }
  }

  return {
    isCanceling,
    handleCancelAppointment,
    submitAppointmentData,
    updateAppointmentData,
    rescheduleAppointment,
  }
})
