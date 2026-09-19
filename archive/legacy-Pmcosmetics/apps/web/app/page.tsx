'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [orderType, setOrderType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">PM.Cosmetics</h1>
          <p className="text-xl mb-8">منصة بيع مستحضرات التجميل المتكاملة - جملة وتجزئة</p>
          
          {/* Order Type Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setOrderType('RETAIL')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                orderType === 'RETAIL'
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-700 text-white border-2 border-white'
              }`}
            >
              🛍️ شراء تجزئة
            </button>
            <button
              onClick={() => setOrderType('WHOLESALE')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                orderType === 'WHOLESALE'
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-700 text-white border-2 border-white'
              }`}
            >
              📦 شراء جملة
            </button>
          </div>

          <button
            onClick={() => router.push('/shop')}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            متابعة التسوق
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">مميزاتنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🚚', title: 'شحن سريع', desc: 'توصيل سريع وآمن' },
              { icon: '💳', title: 'دفع آمن', desc: 'جميع وسائل الدفع' },
              { icon: '⭐', title: 'منتجات موثوقة', desc: 'أفضل العلامات التجارية' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-4xl mb-4">{feature.icon}</p>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">هل أنت بائع؟</h2>
          <p className="text-lg mb-8">انضم إلينا الآن وابدأ ببيع منتجاتك</p>
          <Link
            href="/seller/register"
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition inline-block"
          >
            تسجيل متجر جديد
          </Link>
        </div>
      </section>
    </>
  );
}
