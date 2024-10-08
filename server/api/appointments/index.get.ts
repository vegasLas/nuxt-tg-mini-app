import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../../utils/getUserFromEvent'
import { isAdminUser } from '../../utils/isAdminUser'

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

  const isAdmin = await isAdminUser(event)

  try {
    if (isAdmin && date) {
      return await handleAdminRequest(date, page, 9)
    } else {
      return await handlePublicRequest(user.id, page, take)
    }
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})

async function handleAdminRequest(date: string, page: number, take: number) {
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(date)
  endDate.setHours(23, 59, 59, 999)

  const whereClause = {
    booked: true,
    time: {
      gte: startDate,
      lte: endDate
    }
  }

  return await fetchAppointments(whereClause, page, take, true, date)
}

async function handlePublicRequest(userId: number, page: number, take: number) {
  const whereClause = {
    booked: true,
    userId: userId
  }

  return await fetchAppointments(whereClause, page, take, false)
}

async function fetchAppointments(whereClause: any, page: number, take: number, includeUser: boolean, date?: string) {
  const [appointments, totalCount] = await Promise.all([
    prisma.appointment.findMany({
      where: whereClause,
      orderBy: { time: 'desc' },
      take: take,
      skip: (page - 1) * take,
      include: { user: includeUser },
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