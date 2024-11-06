import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../../utils/getUserFromEvent'
import { format } from 'date-fns'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  const isAdmin = await isAdminUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = event.context.params?.id
  try {
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Appointment ID is required' })
    }
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingAppointment || existingAppointment.userId !== user.id && !isAdmin) {
      throw createError({ statusCode: 404, statusMessage: 'Appointment not found or not authorized' })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { 
        booked: false,
      },  
    })
    if (!isAdmin) {
      const admins = await prisma.admin.findMany({
        include: {
          user: true, // Includes the related User
        },
      })
      const message = `⚠️ Клиент отменил запись\n
      ${updatedAppointment.name ? `Имя: ${updatedAppointment.name}` : ''}
      ${updatedAppointment.phoneNumber ? `Телефон: ${updatedAppointment.phoneNumber}` : ''}
      ${updatedAppointment.time ? `Число: ${format(updatedAppointment.time, 'dd.MM.yyyy')}` : ''}
      ${updatedAppointment.time ? `Время: ${format(updatedAppointment.time, 'HH:mm')}` : ''}
      ${updatedAppointment.comment ? `Комментарий: ${updatedAppointment.comment}` : ''}
      `
      admins.forEach(admin => {
        if (admin.user.chatId) {
          TBOT.sendMessage(admin.user.chatId, message).catch(error => {
            console.error('Error sending message to admin after deleting appointment:', error)
          })
        }
      })
    }
    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting appointment:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})