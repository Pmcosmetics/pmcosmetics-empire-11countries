import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get Product Reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create Review
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { productId, orderId, rating, title, content, images } = req.body;

    const review = await prisma.review.create({
      data: {
        userId: req.userId,
        productId,
        orderId,
        rating,
        title,
        content,
        images: images ? JSON.stringify(images) : null,
        verified: !!orderId,
      },
      include: { user: true },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

export default router;
