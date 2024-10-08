import { defineEventHandler, getQuery, createError } from 'h3'
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

  const query = getQuery(event)
  const id = query.id as string

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: ID parameter is required',
    })
  }

  await prisma.disabledTime.delete({
    where: { id },
  })

  return { message: 'Disabled time removed successfully' }
})