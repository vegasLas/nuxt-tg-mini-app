import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay } from 'date-fns'
import { getDateRange } from '~/utils/getDatesRange'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Check if the user is an admin
  if (!isAdminUser(event)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required',
    })
  }

  try {
    const today = new Date()
    const dateRange = getDateRange(today)
    const { startDate, endDate } = dateRange

    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    const [totalCount, todayCount] = await Promise.all([
      prisma.appointment.count({
        where: {
          booked: true,
          time: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.appointment.count({
        where: {
          booked: true,
          time: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
    ])

    return { 
      totalCount,
      todayCount,
      dates: dateRange 
    }
  } catch (error) {
    console.error('Error fetching appointment counts:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
