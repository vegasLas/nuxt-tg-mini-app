import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../../utils/getUserFromEvent'

const prisma = new PrismaClient()
const ITEMS_PER_PAGE = 5

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1

  try {
    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where: { userId: user.id, booked: true },
        orderBy: { time: 'desc' },
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE,
      }),
      prisma.appointment.count({
        where: { userId: user.id, booked: true },
      }),
    ])

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    const nextPage = page < totalPages ? page + 1 : null

    const response = {
      appointments,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: ITEMS_PER_PAGE,
        nextLink: nextPage ? `/api/appointments?page=${nextPage}` : null,
      },
    }

    return response
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})