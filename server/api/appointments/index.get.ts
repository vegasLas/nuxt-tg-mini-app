import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../../utils/getUserFromEvent'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id, booked: true }
    }) as Appointment[]
    return appointments
  } catch (error) {
    console.error('Error fetching appointment:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})