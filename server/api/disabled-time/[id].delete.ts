import { defineEventHandler, getQuery, createError } from 'h3'
import { isAdminUser } from '~/server/utils/isAdminUser'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const isAdmin = await isAdminUser(event)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'У вас нет доступа к этой функции',
    })
  }

  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Неверный запрос: Параметр ID обязателен',
    })
  }

  // Check if the disabled time exists
  const existingDisabledTime = await prisma.disabledTime.findUnique({
    where: { id },
  })

  if (!existingDisabledTime) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Не найдено: Время отключено не найдено',
    })
  }

  const result = await prisma.disabledTime.update({
    where: { id },
    select: { id: true, date: true, slot: true },
    data: { isActive: true },
  })

  return result
})
