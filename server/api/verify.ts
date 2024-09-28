import { PrismaClient } from '@prisma/client'
import { defineEventHandler } from 'h3'
import type { User } from '~/types'
import { getUserFromEvent } from '../utils/getUserFromEvent'
import { createError } from 'h3' // Import createError

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
        return await prisma.user.findUnique({ where: { id: user.id } }) as User | null
  }
  throw createError({ statusCode: 405, statusMessage: `Method ${method} not allowed` }) // Use createError
})