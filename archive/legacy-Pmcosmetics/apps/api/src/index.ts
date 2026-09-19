import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import userRoutes from './routes/users';
import storeRoutes from './routes/stores';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import reviewRoutes from './routes/reviews';
import invoiceRoutes from './routes/invoices';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(logger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.API_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 PM.Cosmetics API Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit();
});
