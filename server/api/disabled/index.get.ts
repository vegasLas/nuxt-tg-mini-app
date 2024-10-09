import { defineEventHandler, createError } from 'h3'
import { isAdminUser } from '~/server/utils/isAdminUser'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const isAdmin = await isAdminUser(event)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required',
    })
  }

  const disabledTimes = await prisma.disabledTime.findMany()
  return disabledTimes
})