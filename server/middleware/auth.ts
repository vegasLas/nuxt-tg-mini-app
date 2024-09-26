import { validate } from '@telegram-apps/init-data-node'
import { H3Event } from 'h3'

const protectedPaths = ['/api']

function isProtectedPath(event: H3Event): boolean {
  const path = event.node.req.url
  return protectedPaths.some(prefix => path?.startsWith(prefix))
}

export default defineEventHandler((event) => {
  console.log('Protected path:', isProtectedPath(event))
  if (!isProtectedPath(event)) {
    return
  }

  const headers = getHeaders(event)
  const initDataRaw = headers['x-init-data'] as string | undefined
  if (!initDataRaw) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing initData'
    })
  }

  try {
    console.log('Validating initData')
    validate(initDataRaw, process.env.TELEGRAM_BOT_TOKEN as string, { expiresIn: 3600 })
  } catch (err) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid initData'
    })
  }
})

