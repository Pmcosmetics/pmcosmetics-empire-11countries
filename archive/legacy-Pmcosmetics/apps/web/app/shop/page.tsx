'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { useQuery } from '@tanstack/react-query';
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

export default function Shop() {
  const [orderType, setOrderType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    page: 1,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters, orderType],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          params: {
            ...filters,
            type: orderType,
          },
        }
      );
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">المتجر</h1>
        
        {/* Order Type Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setOrderType('RETAIL')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              orderType === 'RETAIL'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            🛍️ تجزئة
          </button>
          <button
            onClick={() => setOrderType('WHOLESALE')}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              orderType === 'WHOLESALE'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            📦 جملة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <FilterSidebar onFilterChange={setFilters} />

        {/* Products Grid */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="text-center py-12">جاري التحميل...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">حدث خطأ في تحميل المنتجات</div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                عدد المنتجات: {data?.pagination?.total || 0}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.products?.map((product: Product) => (
                  <ProductCard key={product.id} product={product} orderType={orderType} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
