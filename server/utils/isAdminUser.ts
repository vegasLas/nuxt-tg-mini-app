import { H3Event } from 'h3'
import { getUserFromEvent } from './getUserFromEvent'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export async function isAdminUser(event: H3Event): Promise<boolean> {
  try {
    const user = await getUserFromEvent(event)
    
    if (!user) {
      return false
    }

    // Check if the user has an associated admin record
    const adminUser = await prisma.admin.findUnique({
      where: {
        userId: user.id
      }
    })

    return !!adminUser
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}