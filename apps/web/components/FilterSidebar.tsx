'use client';

import { useState } from 'react';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const handleFilterChange = () => {
    onFilterChange({
      search,
      minPrice,
      maxPrice,
      page: 1,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-20">
      <h2 className="text-xl font-bold mb-6">تصفية النتائج</h2>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2">البحث</label>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleFilterChange();
          }}
          placeholder="ابحث عن منتجات..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
        />
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2">نطاق السعر</label>
        <div className="space-y-3">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(Number(e.target.value));
              handleFilterChange();
            }}
            placeholder="السعر الأدنى"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              handleFilterChange();
            }}
            placeholder="السعر الأقصى"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-sm text-gray-600">
            {minPrice} - {maxPrice} ريال
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm font-bold mb-2">الفئات</label>
        <div className="space-y-2">
          {[
            { id: '1', name: 'العناية بالبشرة' },
            { id: '2', name: 'مستحضرات الشعر' },
            { id: '3', name: 'المكياج' },
            { id: '4', name: 'العطور' },
          ].map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
