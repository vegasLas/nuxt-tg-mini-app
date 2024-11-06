import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay } from 'date-fns'

const prisma = new PrismaClient()
export default defineEventHandler(async (event) => {
  // Check if the user is an admin
  if (!isAdminUser(event)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required',
    })
  }
  const query = getQuery(event)
  const date = query.date as string

  if (!date) {
    throw createError({
      statusCode: 400,
      message: 'Date parameter is required',
    })
  }
  try {
    const moscowDate = parseToMoscowTime(date)
    const dayStart = startOfDay(moscowDate)
    const dayEnd = endOfDay(moscowDate)
    console.log('moscow date', moscowDate, 'dayStart', dayStart, 'dayEnd', dayEnd)
    const appointments = await prisma.appointment.findMany({
      where: {
        booked: true,
        time: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        user: {
          select: {
            username: true,
            name: true
          },
        },
      },
    })
    return appointments
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
