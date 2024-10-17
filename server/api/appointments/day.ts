import { PrismaClient } from '@prisma/client'
import { isAdminUser } from '~/server/utils/isAdminUser'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

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
    const parsedDate = parseISO(date)
    const dayStart = startOfDay(parsedDate)
    const dayEnd = endOfDay(parsedDate)

    const appointments = await prisma.appointment.findMany({
      where: {
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
