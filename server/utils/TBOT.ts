import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
// let bot: TelegramBot
const TBOT = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
	polling: {
		interval: 800,
		autoStart: true,
		params: {
		timeout: 100
	}
}});
export default TBOT