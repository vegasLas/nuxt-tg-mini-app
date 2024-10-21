import { PrismaClient } from '@prisma/client'
import { parseISO, startOfDay, endOfDay } from 'date-fns'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const startDateParam = query.startDate as string | undefined
    const endDateParam = query.endDate as string | undefined

    let startDate: Date
    let endDate: Date

    if (startDateParam && endDateParam) {
      // If specific date range is provided, check if the user is an admin
      if (!isAdminUser(event)) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
      }
      startDate = startOfDay(parseISO(startDateParam))
      endDate = endOfDay(parseISO(endDateParam))
    } else {
      // If no date range is provided, fetch appointments for the next 30 days
      startDate = startOfDay(new Date())
      endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        time: true
      },
      where: {
        booked: true,
        time: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        time: 'asc'
      }
    })
    return appointments
  } catch (error) {
    console.error('Error fetching appointment schedule:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})
