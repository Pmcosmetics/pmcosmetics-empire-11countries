import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get Cart
router.get('/', authenticate, async (req: any, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId, sessionId: '' },
        include: { items: true },
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to Cart
router.post('/items', authenticate, async (req: any, res) => {
  try {
    const { productId, quantity, price, variantId } = req.body;

    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId, sessionId: '' },
      });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || '',
        },
      },
      update: { quantity: { increment: quantity } },
      create: {
        cartId: cart.id,
        productId,
        quantity,
        price,
        variantId,
      },
    });

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Remove from Cart
router.delete('/items/:itemId', authenticate, async (req: any, res) => {
  try {
    await prisma.cartItem.delete({
      where: { id: req.params.itemId },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

export default router;
