import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const DEFAULT_ITEMS_PER_PAGE = 5

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  const isAdmin = await isAdminUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const take = isAdmin ? 100 : DEFAULT_ITEMS_PER_PAGE

  try {
    let whereClause: any = {
      booked: true,
    }

    // Only apply userId filter for non-admin users
    if (!isAdmin) {
      whereClause.userId = user.id
    }

    // Add date range filter for admin users
    if (isAdmin && startDate && endDate) {
      whereClause.time = {
        gte: parseToMoscowTime(startDate),
        lte: parseToMoscowTime(endDate),
      }
    }
    return await fetchAppointments(whereClause, page, take)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})

async function fetchAppointments(whereClause: any, page: number, take: number) {
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
      nextLink: nextPage ? `/api/appointments?page=${nextPage}&take=${take}` : null,
    },
  }
}
