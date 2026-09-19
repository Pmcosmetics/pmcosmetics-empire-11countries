'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';

export default function Register() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const password = watch('password');

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          email: data.email,
          phone: data.phone,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }
      );

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">إنشاء حساب جديد</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم الأول</label>
              <input
                {...register('firstName', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
                placeholder="أحمد"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الاسم الأخير</label>
              <input
                {...register('lastName', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
                placeholder="محمد"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
            <input
              {...register('email', { required: true })}
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
            <input
              {...register('phone', { required: true })}
              type="tel"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
              placeholder="201000000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">كلمة المرور</label>
            <input
              {...register('password', { required: true })}
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
            <input
              {...register('confirmPassword', { required: true })}
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          هل لديك حساب بالفعل؟{' '}
          <a href="/login" className="text-purple-600 font-bold hover:underline">
            تسجيل دخول
          </a>
        </p>
      </div>
    </div>
  );
}
