import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'
import type { User } from '~/types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const id = event.context.params?.id

  switch (method) {
    case 'GET':
      if (id) {
        return await prisma.user.findUnique({ where: { id: parseInt(id) } }) as User | null
      }
      return await prisma.user.findMany() as User[]

    case 'POST':
      const createData = await readBody(event) as Omit<User, 'id'>
      return await prisma.user.create({ data: createData }) as User

    case 'PUT':
      if (id) {
        const updateData = await readBody(event) as Partial<User>
        return await prisma.user.update({
          where: { id: parseInt(id) },
          data: updateData,
        }) as User
      }
      break

    case 'DELETE':
      if (id) {
        return await prisma.user.delete({ where: { id: parseInt(id) } }) as User
      }
      break
  }

  throw new Error(`Method ${method} not allowed`)
})