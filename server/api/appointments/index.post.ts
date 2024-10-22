import { PrismaClient } from '@prisma/client'
import type { Appointment } from '~/types'
import { getUserFromEvent } from '../../utils/getUserFromEvent'
import { parseISO } from 'date-fns'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Не авторизован' });
  }

  const isAdmin = await isAdminUser(event);
  const { time } = await readBody(event) as Omit<Appointment, 'id' | 'user' | 'userId'>;
  
  const disabledDaysStore = useDisabledTimeStore();
  await disabledDaysStore.fetchDisabledDays();

  if (disabledDaysStore.isDisabledDay(parseISO(time)) && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusText: 'Выбранная дата заблокирована. Пожалуйста, выберите другую дату.'
    });
  }

  const activeAppointmentsCount = await prisma.appointment.count({
    where: {
      userId: user.id,
      booked: true,
      time: { gt: new Date() }
    }
  });

  if (activeAppointmentsCount >= 2 && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusText: 'У вас уже есть 2 активных записи. Пожалуйста, отмените одну из них, прежде чем создавать новую.'
    });
  }

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      time: parseISO(time),
      booked: true,
      userId: user.id
    }
  });

  if (existingAppointment) {
    throw createError({
      statusCode: 409,
      statusText: 'На это время уже есть запись. Пожалуйста, выберите другое время.'
    });
  }

  const createData = await readBody(event) as Omit<Appointment, 'id' | 'user' | 'userId'>;
  return prisma.appointment.create({
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      comment: true,
      time: true,
      booked: true,
      userId: true
    },
    data: {
      ...createData,
      userId: user.id
    }
  });
});
