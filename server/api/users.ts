import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Create a new user
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;