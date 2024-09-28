import { PrismaClient } from '@prisma/client'
import type { User } from '~/types'
import { getUserFromEvent } from '../utils/getUserFromEvent'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  // Verify user using getUserFromEvent
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'User not authenticated' }) // Use createError
  }
  switch (method) {
    case 'GET':
      const userWithDetails = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          appointments: {
            select: {
              id: true, // Select only the id to count
            },
          },
        },
      }) as User | null

      // Add appointments count and admin status to the response
      return {
        ...userWithDetails,
        appointmentsCount: userWithDetails?.appointments?.length || 0,
        isAdmin: !!userWithDetails?.admin, // Check if admin relation exists
      }
  }
  throw createError({ statusCode: 405, statusMessage: `Method ${method} not allowed` }) // Use createError
})