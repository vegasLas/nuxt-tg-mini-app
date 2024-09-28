import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody, createError } from 'h3' // Added createError import
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../utils/getUserFromEvent'
import { parseInitData } from '../utils/parseInitData'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const id = event.context.params?.id

  // Get user from event
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' }) // Updated to createError
  }

  switch (method) {
    case 'GET':
      if (id) {
        return await prisma.appointment.findUnique({ where: { id: parseInt(id) } }) as Appointment | null
      }
      return await prisma.appointment.findMany() as Appointment[]

    case 'POST':
      const createData = await readBody(event) as Omit<Appointment, 'id' | 'user'>
      return await prisma.appointment.create({
        data: {
          ...createData,
          userId: user.id
        }
      }) as Appointment

    case 'PUT':
      if (id) {
        const updateData = await readBody(event) as Partial<Omit<Appointment, 'id' | 'user'>>
        
        // Check if the user has the appointment
        const existingAppointment = await prisma.appointment.findUnique({
          where: { id: parseInt(id) }
        })
        
        if (!existingAppointment || existingAppointment.userId !== user.id) {
          throw createError({ statusCode: 404, statusMessage: 'Appointment not found or not authorized' }) // Updated to createError
        }
        
        return await prisma.appointment.update({
          where: { id: parseInt(id) },
          data: updateData,
        }) as Appointment
      }
      break
      
    case 'DELETE':
      if (id) {
        // Check if the user has the appointment
        const existingAppointment = await prisma.appointment.findUnique({
          where: { id: parseInt(id) }
        })
        
        if (!existingAppointment || existingAppointment.userId !== user.id) {
          throw createError({ statusCode: 404, statusMessage: 'Appointment not found or not authorized' }) // Updated to createError
        }
        
        return await prisma.appointment.delete({ where: { id: parseInt(id) } }) as Appointment
      }
      break
  }

  throw createError({ statusCode: 405, statusMessage: `Method ${method} not allowed` }) // Updated to createError
})