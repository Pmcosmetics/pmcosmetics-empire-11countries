'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  retailPrice: number;
  wholesalePrice?: number;
  images: { url: string }[];
  rating: number;
  stock: number;
}

export default function ProductCard({
  product,
  orderType,
}: {
  product: Product;
  orderType: 'RETAIL' | 'WHOLESALE';
}) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const displayPrice =
    orderType === 'WHOLESALE' ? product.wholesalePrice || product.price : product.price;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/items`,
        {
          productId: product.id,
          quantity,
          price: displayPrice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('تم إضافة المنتج إلى السلة');
    } catch (error) {
      alert('يجب تسجيل الدخول أولاً');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-200">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            💄
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.nameAr}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400">
            {'★'.repeat(Math.floor(product.rating || 0))}
            {'☆'.repeat(5 - Math.floor(product.rating || 0))}
          </div>
          <span className="text-sm text-gray-600">({product.rating})</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-purple-600">{displayPrice} ريال</p>
          {orderType === 'WHOLESALE' && (
            <p className="text-sm text-gray-500 line-through">{product.price} ريال</p>
          )}
        </div>

        {/* Stock Status */}
        <p className={`text-sm mb-4 ${
          product.stock > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {product.stock > 0 ? `متوفر (${product.stock})` : 'غير متوفر'}
        </p>

        {/* Add to Cart */}
        {product.stock > 0 && (
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-20 px-2 py-2 border rounded text-center"
            />
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {addingToCart ? 'جاري الإضافة...' : '🛒 إضافة'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
