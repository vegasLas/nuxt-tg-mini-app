import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'
import type { Notification } from '../types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const id = event.context.params?.id

  switch (method) {
    case 'GET':
      if (id) {
        return await prisma.notification.findUnique({ where: { id: parseInt(id) } }) as Notification | null
      }
      return await prisma.notification.findMany() as Notification[]

    case 'POST':
      const createData = await readBody(event) as Omit<Notification, 'id' | 'createdAt'>
      return await prisma.notification.create({ data: createData }) as Notification

    case 'PUT':
      if (id) {
        const updateData = await readBody(event) as Partial<Notification>
        return await prisma.notification.update({
          where: { id: parseInt(id) },
          data: updateData,
        }) as Notification
      }
      break

    case 'DELETE':
      if (id) {
        return await prisma.notification.delete({ where: { id: parseInt(id) } }) as Notification
      }
      break
  }

  throw new Error(`Method ${method} not allowed`)
})