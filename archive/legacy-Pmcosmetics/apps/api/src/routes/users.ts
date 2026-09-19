import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get User Profile
router.get('/profile', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        addresses: true,
        orders: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update User Profile
router.put('/profile', authenticate, async (req: any, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { firstName, lastName, phone, avatar },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add Address
router.post('/addresses', authenticate, async (req: any, res) => {
  try {
    const { label, firstName, lastName, phone, street, city, state, country, zipCode, isDefault } = req.body;

    const address = await prisma.address.create({
      data: {
        userId: req.userId,
        label,
        firstName,
        lastName,
        phone,
        street,
        city,
        state,
        country,
        zipCode,
        isDefault,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Get Addresses
router.get('/addresses', authenticate, async (req: any, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId },
    });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

export default router;
