import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Fetch available slots
router.get('/available', async (req, res) => {
  try {
    const slots = await prisma.appointment.findMany({
      where: { booked: false },
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Book an appointment
router.post('/book/:id', async (req, res) => {
  const slotId = parseInt(req.params.id, 10);
  const userId = req.body.userId;
  try {
    const slot = await prisma.appointment.findUnique({
      where: { id: slotId },
    });
    if (slot && !slot.booked) {
      await prisma.appointment.update({
        where: { id: slotId },
        data: { booked: true, userId: userId },
      });
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Modify an appointment
router.put('/modify/:id', async (req, res) => {
  const slotId = parseInt(req.params.id, 10);
  const newTime = req.body.time;
  try {
    const slot = await prisma.appointment.findUnique({
      where: { id: slotId },
    });
    if (slot && slot.booked) {
      await prisma.appointment.update({
        where: { id: slotId },
        data: { time: newTime },
      });
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to modify appointment' });
  }
});

// Cancel an appointment
router.delete('/cancel/:id', async (req, res) => {
  const slotId = parseInt(req.params.id, 10);
  try {
    const slot = await prisma.appointment.findUnique({
      where: { id: slotId },
    });
    if (slot && slot.booked) {
      await prisma.appointment.update({
        where: { id: slotId },
        data: { booked: false },
      });
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// List all services
router.get('/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Add a new service
router.post('/services', async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const service = await prisma.service.create({
      data: { name, description, price },
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add service' });
  }
});

// List notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Add a notification for a user
router.post('/notifications', async (req, res) => {
  const { message, userId } = req.body;
  try {
    const notification = await prisma.notification.create({
      data: { message, userId },
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add notification' });
  }
});

export default router;