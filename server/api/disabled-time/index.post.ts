import { defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from '@prisma/client'
import type { CreateDisabledTimeInput } from '~/server/types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const isAdmin = await isAdminUser(event)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'У вас нет доступа к этой функции',
    })
  }

  const body = await readBody<CreateDisabledTimeInput>(event)
  console.log(body.date)
  if (!body.date && !body.slot) {
    throw createError({
      statusCode: 400,
      message: 'Неверный запрос: Неверные данные',
    })
  }

  const disabledTime = await prisma.disabledTime.create({
    select: { id: true, date: true, slot: true },
    data: {
      date: body.date,
      slot: body.slot,
      isActive: false,
    },
  })

  return disabledTime
})
