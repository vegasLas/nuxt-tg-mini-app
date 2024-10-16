import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../../utils/getUserFromEvent'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Appointment ID is required' })
  }

  const updateData = await readBody(event) as Partial<Omit<Appointment, 'id' | 'user'>>
  
  // Check if the user has the appointment
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: parseInt(id) }
  })
  
  if (!existingAppointment || existingAppointment.userId !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Appointment not found or not authorized' })
  }
  
  const updatedAppointment = await prisma.appointment.update({
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      comment: true,
      time: true,
      userId: true,
      booked: true,
    },
    where: { id: parseInt(id) },
      data: updateData,
    })
    return updatedAppointment
  } catch (error) {
    console.error('Error updating appointment:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})