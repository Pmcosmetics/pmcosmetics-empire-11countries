'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="bg-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            💄 PM.Cosmetics
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center">
            <Link href="/" className="hover:opacity-80 transition">
              الرئيسية
            </Link>
            <Link href="/shop" className="hover:opacity-80 transition">
              المتجر
            </Link>
            <Link href="/seller/register" className="hover:opacity-80 transition">
              بيع معنا
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="hover:opacity-80 transition">
                  لوحة التحكم
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:opacity-80 transition">
                  دخول
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-purple-600 px-4 py-2 rounded font-bold hover:bg-gray-100 transition"
                >
                  تسجيل
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link href="/" className="block hover:opacity-80 transition">
              الرئيسية
            </Link>
            <Link href="/shop" className="block hover:opacity-80 transition">
              المتجر
            </Link>
            <Link href="/seller/register" className="block hover:opacity-80 transition">
              بيع معنا
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="block hover:opacity-80 transition">
                  لوحة التحكم
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition text-left"
                >
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block hover:opacity-80 transition">
                  دخول
                </Link>
                <Link href="/register" className="block hover:opacity-80 transition">
                  تسجيل
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
