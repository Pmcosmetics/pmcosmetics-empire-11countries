import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create Store (Seller)
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { name, description, email, phone, storeType = 'RETAIL' } = req.body;

    const store = await prisma.store.create({
      data: {
        ownerId: req.userId,
        name,
        description,
        email,
        phone,
        storeType,
        country: 'Egypt',
        state: 'Cairo',
        city: 'Cairo',
        address: '',
        zipCode: '',
      },
    });

    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Get Store
router.get('/:storeId', async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.storeId },
      include: {
        products: { take: 10 },
        _count: { select: { products: true, orders: true } },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Get My Store
router.get('/', authenticate, async (req: any, res) => {
  try {
    const store = await prisma.store.findFirst({
      where: { ownerId: req.userId },
      include: { products: true, orders: true },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

export default router;
