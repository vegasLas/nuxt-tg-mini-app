import { PrismaClient } from '@prisma/client'
import { getUserFromEvent } from '../../utils/getUserFromEvent'
import type { Appointment } from '~/types'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = event.context.params?.id
  console.log('delete id', id)
  try {
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Appointment ID is required' })
    }
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingAppointment || existingAppointment.userId !== user.id) {
      throw createError({ statusCode: 404, statusMessage: 'Appointment not found or not authorized' })
    }

    await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { 
        booked: false,
      },
    }) as Appointment

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting appointment:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
  }
})