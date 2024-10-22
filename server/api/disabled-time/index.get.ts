import { defineEventHandler, getQuery, createError } from 'h3'
import { PrismaClient } from '@prisma/client'
import { parseISO, addDays, startOfDay } from 'date-fns'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.startDate ? parseISO(query.startDate as string) : startOfDay(new Date())
  const endDate = query.endDate ? parseISO(query.endDate as string) : addDays(new Date(), 30)

  let dateFilter = {
    date: {
      gte: startDate,
      lte: endDate,
    },
  }

  try {
    const disabledTimes = await prisma.disabledTime.findMany({
      where: dateFilter,
      select: {
        id: true,
        date: true,
        slot: true,
      },
      orderBy: {
        date: 'asc',
      },
    })
    return disabledTimes
  } catch (error) {
    console.error('Ошибка при получении отключенных времен:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Внутренняя ошибка сервера',
    })
  }
})
