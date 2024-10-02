import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../utils/getUserFromEvent'
import type { EventHandler, EventHandlerRequest } from 'h3'
const prisma = new PrismaClient()
export const appointmentsHandlers: EventHandler<EventHandlerRequest, any> =  async (event) => {
  const method = event.node.req.method
  const id = event.context.params?.id

  // Get user from event
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' }) // Updated to createError
  }

  switch (method) {
    case 'GET':
      try {
          const appointments = await prisma.appointment.findMany({
            where: { userId: user.id }
          }) as Appointment[]
          return appointments
      } catch (error) {
        console.error('Error fetching appointment:', error)
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
      }

    case 'POST':
      const createData = await readBody(event) as Omit<Appointment, 'id' | 'user'>
      return await prisma.appointment.create({
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          comment: true,
          time: true,
          booked: true,
        },
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
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            comment: true,
            time: true,
            booked: true,
          },
          where: { id: parseInt(id) },
          data: updateData,
        }) as Appointment
      }
      break
      
    case 'DELETE':
      if (id) {
        console.log('delete', id)
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
}

export default defineEventHandler(appointmentsHandlers)