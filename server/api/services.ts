import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'
import type { Service } from '../types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const id = event.context.params?.id

  switch (method) {
    case 'GET':
      if (id) {
        return await prisma.service.findUnique({ where: { id: parseInt(id) } }) as Service | null
      }
      return await prisma.service.findMany() as Service[]

    case 'POST':
      const createData = await readBody(event) as Omit<Service, 'id'>
      return await prisma.service.create({ data: createData }) as Service

    case 'PUT':
      if (id) {
        const updateData = await readBody(event) as Partial<Service>
        return await prisma.service.update({
          where: { id: parseInt(id) },
          data: updateData,
        }) as Service
      }
      break

    case 'DELETE':
      if (id) {
        return await prisma.service.delete({ where: { id: parseInt(id) } }) as Service
      }
      break
  }

  throw new Error(`Method ${method} not allowed`)
})