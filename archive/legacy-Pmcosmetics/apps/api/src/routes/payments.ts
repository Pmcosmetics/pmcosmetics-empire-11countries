import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Create Payment (Stripe or PayPal)
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { orderId, method, amount } = req.body;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        method,
        amount,
        transactionId: `TXN-${Date.now()}`,
        gateway: method === 'CREDIT_CARD' ? 'stripe' : 'paypal',
        status: 'PENDING',
      },
    });

    // TODO: Integrate with Stripe/PayPal API

    res.json({
      payment,
      clientSecret: 'test_secret', // Would be from Stripe/PayPal
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Verify Payment
router.post('/verify/:paymentId', authenticate, async (req: any, res) => {
  try {
    const { transactionId } = req.body;

    const payment = await prisma.payment.update({
      where: { id: req.params.paymentId },
      data: {
        status: 'COMPLETED',
        transactionId,
      },
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: 'COMPLETED' },
    });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;
