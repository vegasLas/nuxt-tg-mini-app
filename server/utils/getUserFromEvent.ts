import { H3Event } from 'h3'
import { PrismaClient } from '@prisma/client'
import type { User } from '~/types'
import { parseInitData } from './parseInitData' // Import the parseInitData utility

const prisma = new PrismaClient()

export async function getUserFromEvent(event: H3Event): Promise<User | null> {
  // Use parseInitData to extract the token
  const initData = parseInitData(event); // Assuming parseInitData returns an object with a token property

  if (!initData) {
    return null
  }

  try {
    
    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { telegramId: initData.user.id },
    })

    return user as User | null
  } catch (error) {
    console.error('Error authenticating user:', error)
    return null
  }
}