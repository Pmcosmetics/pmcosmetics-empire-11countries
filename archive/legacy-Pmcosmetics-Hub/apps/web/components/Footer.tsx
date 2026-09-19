'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">عن PM.Cosmetics</h3>
            <p className="text-sm">
              منصة بيع إلكترونية متكاملة لمستحضرات التجميل
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">الروابط</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/shop">المتجر</Link></li>
              <li><Link href="/seller/register">بيع معنا</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">خدمة العملاء</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#">تتبع الطلب</a></li>
              <li><a href="#">السياسات</a></li>
              <li><a href="#">الأسئلة الشائعة</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">اتصل بنا</h3>
            <ul className="space-y-2 text-sm">
              <li>📧 Email: support@pmcosmetics.com</li>
              <li>📱 WhatsApp: <a href="https://wa.me/c/201055655649" className="text-purple-400">اتصل بنا</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; 2026 PM.Cosmetics. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
