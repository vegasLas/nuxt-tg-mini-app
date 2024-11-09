import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../../utils/getUserFromEvent'
import { startOfDay, endOfDay, format } from 'date-fns'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Не авторизован' });
  }

  const isAdmin = await isAdminUser(event);
  const { time } = await readBody(event) as Omit<Appointment, 'id' | 'user' | 'userId'>;
  const appointmentDate = parseToMoscowTime(time);
  
  // Check if the appointment time falls within a disabled day range
  const disabledTime = await prisma.disabledTime.findFirst({
    where: {
      date: {
        gte: startOfDay(appointmentDate),
        lte: endOfDay(appointmentDate)
      },
      slot: appointmentDate
    }
  });

  if (disabledTime) {
    throw createError({
      statusCode: 403,
      statusText: 'Выбранная дата недоступна для записи. Пожалуйста, выберите другую дату.'
    });
  }

  const activeAppointmentsCount = await prisma.appointment.count({
    where: {
      userId: user.id,
      booked: true,
      time: { gt: new Date() }
    }
  });

  if (activeAppointmentsCount >= 2 && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusText: 'У вас уже есть 2 активных записи. Пожалуйста, отмените одну из них, прежде чем создавать новую.'
    });
  }

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      time: appointmentDate,
      booked: true,
      userId: user.id
    }
  });

  if (existingAppointment) {
    throw createError({
      statusCode: 409,
      statusText: 'На это время уже есть запись. Пожалуйста, выберите другое время.'
    });
  }

  const createData = await readBody(event) as Omit<Appointment, 'id' | 'user' | 'userId'>;
  const newAppointment = await prisma.appointment.create({
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      comment: true,
      time: true,
      booked: true,
      userId: true
    },
    data: {
      ...createData,
      userId: user.id
    }
  });

  // Add notification to user
  if (user.chatId) {
    const message = [
        `✅ ${isAdmin ? 'Запись успешно создана' : 'Вы успешно записались'}`,
        newAppointment.name ? `👤 Имя: ${newAppointment.name}` : '',
        newAppointment.phoneNumber ? `📱 Телефон: ${newAppointment.phoneNumber}` : '',
        newAppointment.time ? `📅 Число: ${format(newAppointment.time, 'dd.MM.yyyy')}` : '',
        newAppointment.time ? `⏰ Время: ${format(newAppointment.time, 'HH:mm')}` : '',
        newAppointment.comment ? `💬 Комментарий: ${newAppointment.comment}` : ''
      ].filter(Boolean).join('\n');
    TBOT.sendMessage(user.chatId, message).catch(error => {
      console.error('Error sending confirmation message to user:', error)
    })
  }

  // Fetch all admin users
  const admins = await prisma.admin.findMany({
    include: {
      user: true, // Includes the related User
    },
  })

  // Prepare the message
  if (!isAdmin) {
    const message = `🔔 Клиент создал запись\n${newAppointment.name ? `👤 Имя: ${newAppointment.name}\n` : ''}${newAppointment.phoneNumber ? `📱 Телефон: ${newAppointment.phoneNumber}\n` : ''}${newAppointment.time ? `📅 Число: ${format(newAppointment.time, 'dd.MM.yyyy')}\n` : ''}${newAppointment.time ? `⏰ Время: ${format(newAppointment.time, 'HH:mm')}\n` : ''}${newAppointment.comment ? `💬 Комментарий: ${newAppointment.comment}\n` : ''}`
    admins.forEach(async (admin) => {
      if (admin.user.telegramId && admin.user.chatId) {
        TBOT.sendMessage(admin.user.chatId , message).catch(error => {
          console.error('Error sending message to admin after creating appointment:', error)
        })
      }
    })
  }
  return newAppointment
  } catch (error) {
    console.error('Error creating appointment:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
});
