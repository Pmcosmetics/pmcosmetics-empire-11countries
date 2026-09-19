import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create Order
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { items, shippingAddressId, billingAddressId, notes, orderType = 'RETAIL' } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      const price = orderType === 'WHOLESALE' ? product.wholesalePrice || product.price : product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        total: itemTotal,
      });
    }

    const tax = subtotal * 0.15; // 15% VAT
    const shippingCost = subtotal > 500 ? 0 : 30; // Free shipping over 500
    const total = subtotal + tax + shippingCost;

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        userId: req.userId,
        storeId: items[0]?.storeId || '',
        subtotal,
        tax,
        shippingCost,
        total,
        orderType,
        items: {
          create: orderItems,
        },
        notes,
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get User Orders
router.get('/', authenticate, async (req: any, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get Order Details
router.get('/:orderId', authenticate, async (req: any, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        items: { include: { product: true } },
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update Order Status (Admin/Seller Only)
router.patch('/:orderId/status', authenticate, async (req: any, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { status },
      include: { items: true },
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
