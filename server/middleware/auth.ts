import { defineEventHandler, createError } from 'h3'
import { createHmac } from 'crypto'

const BOT_TOKEN = process.env.BOT_TOKEN

export default defineEventHandler((event) => {
  const initData = event.node.req.headers['telegram-init-data'] as string

  if (!initData) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Missing Telegram init data',
    })
  }

  const secret = createHmac('sha256', 'WebAppData').update(BOT_TOKEN || '').digest()
  
  // Parse and validate the init data
  const urlParams = new URLSearchParams(initData)
  const hash = urlParams.get('hash')
  urlParams.delete('hash')
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const calculatedHash = createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex')

  if (calculatedHash !== hash) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Invalid Telegram init data',
    })
  }

  // If validation passes, you can optionally set some data in the event context
  event.context.telegramUser = JSON.parse(urlParams.get('user') || '{}')
})