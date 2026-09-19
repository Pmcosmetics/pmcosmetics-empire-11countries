'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(data);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'orders', label: 'الطلبات' },
          { id: 'addresses', label: 'العناوين' },
          { id: 'wishlist', label: 'المفضلة' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold transition ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">ملفي الشخصي</h2>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>الاسم:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>البريد:</strong> {user.email}</p>
            <p><strong>الهاتف:</strong> {user.phone}</p>
            <p><strong>الدور:</strong> {user.role}</p>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">طلباتي</h2>
          <p className="text-gray-600">لا توجد طلبات حتى الآن</p>
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">عناويني</h2>
          <p className="text-gray-600">لا توجد عناوين محفوظة</p>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">قائمة المفضلة</h2>
          <p className="text-gray-600">قائمتك المفضلة فارغة</p>
        </div>
      )}
    </div>
  );
}
