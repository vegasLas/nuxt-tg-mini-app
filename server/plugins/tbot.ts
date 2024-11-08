import { PrismaClient } from "@prisma/client";
import schedule from 'node-schedule';
import { format, startOfDay, addDays, endOfDay } from 'date-fns';
const prisma = new PrismaClient()
async function sendAppointmentSummary() {
	try {
		// Get tomorrow's date
		const tomorrow = startOfDay(addDays(new Date(), 1));
		const tomorrowEnd = endOfDay(tomorrow);

		// Check if tomorrow is a weekend (0 = Sunday, 6 = Saturday)
		const isWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;

		// Check if tomorrow is a disabled day
		const disabledDay = await prisma.disabledTime.findFirst({
			where: {
				date: tomorrow
			}
		});

		// Get all appointments for tomorrow
		const appointments = await prisma.appointment.findMany({
			where: {
				booked: true,
				time: {
					gte: tomorrow,
					lt: tomorrowEnd
				}
			},
			include: {
				user: true
			}
		});
		appointments.sort((a, b) => a.time.getTime() - b.time.getTime());
		// Get admin users
		const adminUsers = await prisma.admin.findMany({
			include: {
				user: true
			}
		});

		// Create message
		const messageHeader = `📅 Записи на завтра (${format(tomorrow, 'dd.MM.yyyy')})\n`;
		
		// Add warning if it's a weekend or disabled day
		let statusMessage = '';
		if (isWeekend) {
			statusMessage = '⚠️ Завтра выходной день!\n';
		}
		if (disabledDay) {
			statusMessage = `⚠️ Завтра нерабочий день:\n`;
		}

		const messageCount = `Всего записей: ${appointments.length}\n\n`;
		
		let messageDetails = appointments.map((apt, index) => {
			return `${index + 1}. ${apt?.name} - ${apt?.phoneNumber} - ${format(apt.time, 'HH:mm')}`;
		}).join('\n');

		// If no appointments, add a note
		if (appointments.length === 0) {
			messageDetails = 'Записей нет';
		}

		const fullMessage = messageHeader + statusMessage + messageCount + messageDetails;

		// Send message to all admin users
		for (const admin of adminUsers) {
			if (admin.user.chatId) {
				await TBOT.sendMessage(admin.user.chatId, fullMessage);
			}
		}
	} catch (error) {
		console.error('Ошибка при отправке сообщения по расписанию:', error);
	}
}

// Add this function after the existing sendAppointmentSummary function
async function sendUserAppointmentReminders() {
	try {
		const tomorrow = startOfDay(addDays(new Date(), 1));
		const tomorrowEnd = endOfDay(tomorrow);

		// Check if tomorrow is a weekend or disabled day
		const isWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;
		const disabledDay = await prisma.disabledTime.findFirst({
			where: {
				date: tomorrow
			}
		});

		// Get all appointments for tomorrow
		const appointments = await prisma.appointment.findMany({
			where: {
				booked: true,
				time: {
					gte: tomorrow,
					lt: tomorrowEnd
				}
			},
			include: {
				user: {
					include: {
						admin: true // Include admin information
					}
				}
			}
		});

		// Send reminder to each user with an appointment
		for (const appointment of appointments) {
			if (appointment.user?.chatId && !appointment.user.admin) {
				let message = '';
					// Message for regular users
					message = `🔔 Напоминание о записи на завтра!\n\n`;
					message += `📅 Дата: ${format(appointment.time, 'dd.MM.yyyy')}\n`;
					message += `⏰ Время: ${format(appointment.time, 'HH:mm')}\n`;


				await TBOT.sendMessage(appointment.user.chatId, message);
			}
		}
	} catch (error) {
		console.error('Ошибка при отправке напоминаний пользователям:', error);
	}
}

export default defineNitroPlugin(async (event) => {
	TBOT.onText(/\/start/, async (msg) => {
		if (!msg.from || msg.from?.is_bot) return
		try {
			const currentChatId = String(msg.chat.id);
			// Check if user exists
			const existingUser = await prisma.user.findUnique({
				where: {
					telegramId: msg.from.id
				}
				// If user doesn't exist, create new user
				// If user doesn't exist, create new user
			});

			if (existingUser) {
				// Update chat ID if it's different
				if (existingUser.chatId !== currentChatId) {
					await prisma.user.update({
						where: {
							telegramId: msg.from.id
						},
						data: {
							chatId: currentChatId
						}
					});
				}
			} else {
				// Create new user if doesn't exist
				await prisma.user.create({
					data: {
						telegramId: msg.from.id,
						username: msg.from.username,
						languageCode: msg.from.language_code,
						chatId: currentChatId,
						//   allowsWriteToPm: msg.from.allows_write_to_pm,
						name: msg.from.first_name + ' ' + msg.from.last_name,
						// If user doesn't exist, create new user
					},
				});
			}
		} catch (error: any) {
			console.error('Error handling user', error)
		}
	});
	
	// Schedule daily appointment summary at 21:00
	schedule.scheduleJob({hour: 18, minute: 0}, () => {
		sendAppointmentSummary();
		sendUserAppointmentReminders(); // Add this line to send reminders
	});
})
