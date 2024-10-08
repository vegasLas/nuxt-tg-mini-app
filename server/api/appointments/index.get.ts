import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../../utils/getUserFromEvent'
import { addDays, startOfDay, endOfDay, isAfter, set } from 'date-fns'

const prisma = new PrismaClient()
const DEFAULT_ITEMS_PER_PAGE = 5

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const date = query.date as string
  const take = DEFAULT_ITEMS_PER_PAGE

  try {
    const { startDate, endDate } = getDateRange(date)
    const whereClause = {
      booked: true,
      userId: user.id,
      time: {
        gte: startDate,
        lte: endDate
      }
    }

    return await fetchAppointments(whereClause, page, take, date)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})

function getDateRange(date: string) {
  const now = new Date()
  const cutoffTime = set(now, { hours: 17, minutes: 0, seconds: 0, milliseconds: 0 })
  const requestDate = date ? new Date(date) : now

  if (isAfter(now, cutoffTime) && requestDate.toDateString() === now.toDateString()) {
    // If it's after 17:00 and the requested date is today, start from tomorrow
    requestDate.setDate(requestDate.getDate() + 1)
  }

  const startDate = startOfDay(requestDate)
  const endDate = endOfDay(addDays(startDate, 30))

  return { startDate, endDate }
}

async function fetchAppointments(whereClause: any, page: number, take: number, date?: string) {
  const [appointments, totalCount] = await Promise.all([
    prisma.appointment.findMany({
      where: whereClause,
      orderBy: { time: 'desc' },
      take: take,
      skip: (page - 1) * take,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        comment: true,
        time: true,
        booked: true,
        userId: true,
      }
    }),
    prisma.appointment.count({
      where: whereClause,
    }),
  ])

  const totalPages = Math.ceil(totalCount / take)
  const nextPage = page < totalPages ? page + 1 : null

  return {
    appointments,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: take,
      nextLink: nextPage ? `/api/appointments?page=${nextPage}&take=${take}${date ? `&date=${date}` : ''}` : null,
    },
  }
}