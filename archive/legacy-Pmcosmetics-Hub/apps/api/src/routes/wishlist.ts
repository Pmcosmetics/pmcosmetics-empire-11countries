import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get Wishlist
router.get('/', authenticate, async (req: any, res) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: req.userId },
      include: { product: { include: { images: true } } },
    });

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to Wishlist
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { productId } = req.body;

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: req.userId,
        productId,
      },
      include: { product: true },
    });

    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from Wishlist
router.delete('/:productId', authenticate, async (req: any, res) => {
  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.userId,
          productId: req.params.productId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
