import { parse } from 'querystring';
import { H3Event } from 'h3'
import { validate } from '@telegram-apps/init-data-node';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  allows_write_to_pm: boolean;
}

interface ParsedInitData {
  query_id: string;
  user: TelegramUser;
  auth_date: number;
  hash: string;
}

export function parseInitData(event: H3Event): ParsedInitData {
  const headers = getHeaders(event)
  const initDataRaw = headers['x-init-data'] as string | undefined
  if (!initDataRaw) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing initData'
    })
  }
  console.log('Validating initData')
  validate(initDataRaw, process.env.TELEGRAM_BOT_TOKEN as string, { expiresIn: 3600 })
  if (!initDataRaw) {
    throw new Error('No init data found')
  }
  const parsedData = parse(initDataRaw) as Record<string, string>;
  
  return {
    query_id: parsedData.query_id,
    user: JSON.parse(parsedData.user),
    auth_date: parseInt(parsedData.auth_date, 10),
    hash: parsedData.hash,
  };
}