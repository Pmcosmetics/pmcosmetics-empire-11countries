import express, { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get All Products (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 20, type = 'RETAIL' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { published: true };

    if (category) where.categoryId = String(category);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { nameAr: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const priceField = type === 'WHOLESALE' ? 'wholesalePrice' : 'price';
    if (minPrice || maxPrice) {
      where[priceField] = {};
      if (minPrice) where[priceField].gte = Number(minPrice);
      if (maxPrice) where[priceField].lte = Number(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          images: true,
          store: { select: { id: true, name: true } },
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get Product Details
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        variants: true,
        reviews: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
        store: true,
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create Product (Seller Only)
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { name, nameAr, description, descriptionAr, price, retailPrice, wholesalePrice, categoryId, images } = req.body;

    const store = await prisma.store.findFirst({
      where: { ownerId: req.userId },
    });

    if (!store) {
      return res.status(403).json({ error: 'You must have a store to create products' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        nameAr,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        descriptionAr,
        price,
        retailPrice,
        wholesalePrice,
        categoryId,
        storeId: store.id,
        sku: `SKU-${Date.now()}`,
        images: {
          create: images?.map((img: string) => ({ url: img })) || [],
        },
      },
      include: { images: true },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

export default router;
