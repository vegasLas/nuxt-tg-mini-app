import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../utils/getUserFromEvent'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Get user from event
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        time: {
          gte: today,
          lte: thirtyDaysFromNow
        }
      },
      orderBy: {
        time: 'asc'
      }
    })

    return {
      success: true,
      data: appointments
    }
  } catch (error) {
    console.error('Error fetching appointment schedule:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})