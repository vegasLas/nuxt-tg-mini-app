import { defineEventHandler, readBody, createError } from 'h3'
import { isAdminUser } from '~/server/utils/isAdminUser'
import { PrismaClient } from '@prisma/client'
import type { CreateDisabledTimeInput } from '~/server/types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const isAdmin = await isAdminUser(event)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required',
    })
  }

  const body = await readBody<CreateDisabledTimeInput>(event)
  if (!body.date || !body.startTime || !body.endTime) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Invalid input',
    })
  }

  const disabledTime = await prisma.disabledTime.create({
    data: {
      date: new Date(body.date),
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    },
  })

  return { message: 'Disabled time added successfully', disabledTime }
})