import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody } from 'h3'
import type { Appointment } from '~/types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const id = event.context.params?.id

  switch (method) {
    case 'GET':
      if (id) {
        return await prisma.appointment.findUnique({ where: { id: parseInt(id) } }) as Appointment | null
      }
      return await prisma.appointment.findMany() as Appointment[]

    case 'POST':
      const createData = await readBody(event) as Omit<Appointment, 'id'>
      return await prisma.appointment.create({ data: createData }) as Appointment

    case 'PUT':
      if (id) {
        const updateData = await readBody(event) as Partial<Appointment>
        return await prisma.appointment.update({
          where: { id: parseInt(id) },
          data: updateData,
        }) as Appointment
      }
      break

    case 'DELETE':
      if (id) {
        return await prisma.appointment.delete({ where: { id: parseInt(id) } }) as Appointment
      }
      break
  }

  throw new Error(`Method ${method} not allowed`)
})