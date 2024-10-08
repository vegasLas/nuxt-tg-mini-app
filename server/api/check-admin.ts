import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../utils/getUserFromEvent'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Verify user using getUserFromEvent
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'User not authenticated' })
  }

  const userWithAdminStatus = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      admin: true,
    },
  })

  if (!userWithAdminStatus) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    isAdmin: !!userWithAdminStatus.admin,
  }
})