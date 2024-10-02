import { H3Event } from 'h3'
import { parseInitData } from '../utils/parseInitData'
import { getUserFromEvent } from '../utils/getUserFromEvent'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const protectedPaths = ['/api']

function isProtectedPath(event: H3Event): boolean {
  const path = event.node.req.url
  return protectedPaths.some(prefix => path?.startsWith(prefix))
}

export default defineEventHandler(async (event) => {
  if (!isProtectedPath(event)) {
    return
  }
  try {
    const initData = parseInitData(event)
    // Get or create user
    const user = await getUserFromEvent(event)
    
    if (!user) {
      // Create new user if not found
      await prisma.user.create({
        data: {
          telegramId: initData.user.id,
          username: initData.user.username,
          languageCode: initData.user.language_code,
          allowsWriteToPm: initData.user.allows_write_to_pm,
          name: initData.user.first_name + ' ' + initData.user.last_name,

        },
      })
    } 
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid initData or user creation failed'
    })
  }
})

