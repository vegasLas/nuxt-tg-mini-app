import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../../utils/getUserFromEvent'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  const isAdmin = await isAdminUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Check for active appointments
  const activeAppointments = await prisma.appointment.count({
    where: {
      userId: user.id,
      booked: true,
      time: {
        gt: new Date()
      }
    }
  })

  if (activeAppointments >= 2 && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusText: 'У вас уже есть 2 активных записи. Пожалуйста, отмените одну из них, прежде чем создавать новую.'
    })
  }

  const createData = await readBody(event) as Omit<Appointment, 'id' | 'user' | 'userId'>
  return await prisma.appointment.create({
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
  })
})
