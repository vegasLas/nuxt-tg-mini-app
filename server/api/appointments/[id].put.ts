import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../../utils/getUserFromEvent'
import { format } from 'date-fns'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event)
    const isAdmin = await isAdminUser(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Appointment ID is required' })
  }

  const updateData = await readBody(event) as Partial<Omit<Appointment, 'id' | 'user'>>
  
  // Check if the user has the appointment
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: parseInt(id) }
  })
  
  if (!existingAppointment || existingAppointment.userId !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Appointment not found or not authorized' })
  }
  const previousTime = existingAppointment.time
  const updatedAppointment = await prisma.appointment.update({
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      comment: true,
      time: true,
      userId: true,
      booked: true,
    },
    where: { id: parseInt(id) },
    data: updateData,
  })

  // Add notification to user
  if (user.chatId) {
    const message = [
      `${isAdmin ? '✏️ Вы изменили запись' : '✏️ Ваша запись изменена'}`,
      updatedAppointment.name ? `👤 Имя: ${updatedAppointment.name}` : '',
      updatedAppointment.phoneNumber ? `📱 Телефон: ${updatedAppointment.phoneNumber}` : '',
      previousTime ? `⏰ Прошлое время: ${format(previousTime, 'dd.MM.yyyy HH:mm')}` : '',
      updatedAppointment.time ? `📅 Новое время: ${format(updatedAppointment.time, 'dd.MM.yyyy HH:mm')}` : '',
      updatedAppointment.comment ? `💬 Комментарий: ${updatedAppointment.comment}` : ''
    ].filter(Boolean).join('\n');

    TBOT.sendMessage(user.chatId, message).catch(error => {
      console.error('Error sending update message to user:', error)
    })
  }

  if (!isAdmin) {
    const admins = await prisma.admin.findMany({
      include: {
        user: true, // Includes the related User
      },
    })
    const message = `🔔 Клиент перенес запись\n${updatedAppointment.name ? `👤 Имя: ${updatedAppointment.name}\n` : ''}${updatedAppointment.phoneNumber ? `📱 Телефон: ${updatedAppointment.phoneNumber}\n` : ''}${previousTime ? `⏰ Прошлое время: ${format(previousTime, 'dd.MM.yyyy HH:mm')}\n` : ''}${updatedAppointment.time ? `📅 Новое время: ${format(updatedAppointment.time, 'dd.MM.yyyy HH:mm')}\n` : ''}${updatedAppointment.comment ? `💬 Комментарий: ${updatedAppointment.comment}\n` : ''}`
    admins.forEach(admin => {
      if (admin.user.chatId) {
        TBOT.sendMessage(admin.user.chatId, message).catch(error => {
          console.error('Error sending message to admin after updating appointment:', error)
        })
      }
    })
  }
  return updatedAppointment
  } catch (error) {
    console.error('Error updating appointment:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})