# 🛍️ PM.Cosmetics - E-Commerce Platform

**منصة متكاملة لبيع مستحضرات التجميل بالجملة والتجزئة**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Development-orange)

## 📋 نظرة عامة

PM.Cosmetics هي منصة بيع إلكترونية متطورة مصممة خصيصاً لمستحضرات التجميل، تدعم:

✅ **البيع بالجملة والتجزئة**
✅ **متعدد المتاجر (Multi-Store)**
✅ **نظام دفع متقدم (Stripe + PayPal)**
✅ **تطبيقات موبايل (iOS + Android)**
✅ **لوحة تحكم إدارية احترافية**
✅ **نظام شحن وتتبع**
✅ **دعم اللغة العربية**
✅ **نظام تقييمات والمراجعات**

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Query** - Data Fetching
- **Zustand** - State Management
- **React Hook Form** - Form Management

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **Redis** - Caching
- **JWT** - Authentication

### Mobile
- **React Native** - Cross Platform
- **Expo** - Development Framework
- **Redux** - State Management

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD

## 📁 البنية الأساسية

```
pmcosmetics/
├── apps/
│   ├── web/                 # Next.js Frontend Store
│   ├── admin/               # Next.js Admin Dashboard
│   ├── api/                 # Express Backend API
│   └── mobile/              # React Native Mobile App
├── packages/
│   ├── database/            # Prisma ORM & Migrations
│   ├── ui/                  # Shared UI Components
│   ├── common/              # Shared Types & Utilities
│   └── api-client/          # API Client Library
├── docs/                    # Documentation
├── .github/workflows/       # CI/CD Workflows
├── docker-compose.yml       # Docker Setup
└── package.json             # Root package.json
```

## 🚀 البدء السريع

### المتطلبات الأساسية
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose
- npm or yarn

### التثبيت

```bash
# 1. Clone Repository
git clone https://github.com/shukrypeter79-max/pmcosmetics.git
cd pmcosmetics

# 2. Install Dependencies
npm install

# 3. Setup Environment
cp .env.example .env.local

# 4. Start Database & Redis
docker-compose up -d

# 5. Database Setup
npm run db:push
npm run db:generate

# 6. Run Development Servers
npm run dev
```

### الوصول إلى التطبيقات

- 🌐 **Frontend Store**: http://localhost:3000
- 📊 **Admin Dashboard**: http://localhost:3001
- 🔌 **API**: http://localhost:3002
- 💾 **Database Studio**: npm run db:studio

## 📊 قاعدة البيانات

تم تصميم قاعدة البيانات لدعم:

### جداول المستخدمين
- Users (العملاء والبائعين)
- Addresses (العناوين)

### جداول المتاجر
- Stores (متاجر البائعين)
- Categories (الفئات)

### جداول المنتجات
- Products (المنتجات)
- ProductImages (الصور)
- ProductVariants (المتغيرات - الحجم واللون)

### جداول الطلبات
- Orders (الطلبات)
- OrderItems (عناصر الطلب)
- Cart & CartItems (السلة)

### جداول الدفع
- Payments (تسجيل الدفع)
- Invoices (الفواتير)

### جداول الشحن
- Shipments (معلومات الشحن)

### جداول إضافية
- Reviews (المراجعات والتقييمات)
- WishlistItems (قائمة المفضلة)
- Notifications (الإخطارات)

## 🔧 الميزات الرئيسية

### 1. نظام البيع المتعدد
- ✅ بيع بالجملة والتجزئة
- ✅ تسعير مختلف حسب نوع البيع
- ✅ حد أدنى لكمية الطلب بالجملة
- ✅ خصومات مخصصة للجملة

### 2. نظام الدفع المتقدم
- ✅ Stripe (بطاقات ائتمان)
- ✅ PayPal
- ✅ التحويل البنكي
- ✅ الدفع عند الاستلام

### 3. إدارة المخزون
- ✅ تتبع المخزون
- ✅ المخزون المحجوز
- ✅ إدارة الم��غيرات

### 4. نظام الشحن
- ✅ تتبع الطلبات
- ✅ حساب تكاليف الشحن تلقائياً
- ✅ دعم حاملي شحن متعددين

### 5. لوحة التحكم
- ✅ إدارة المنتجات
- ✅ إدارة الطلبات
- ✅ تقارير المبيعات
- ✅ إدارة المستخدمين
- ✅ إدارة التخصيصات

## 📱 تطبيق الموبايل

تطبيق متطور يدعم:
- ✅ iOS و Android
- ✅ التسوق والبحث
- ✅ إدارة السلة
- ✅ تتبع الطلبات
- ✅ إشعارات فورية

## 📚 الوثائق

- [Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🔐 الأمان

- ✅ JWT Authentication
- ✅ Password Hashing (bcryptjs)
- ✅ CORS Protection
- ✅ Rate Limiting
- ✅ SQL Injection Prevention
- ✅ XSS Protection

## 📊 الأداء

- ✅ Caching with Redis
- ✅ Database Indexing
- ✅ API Rate Limiting
- ✅ Image Optimization
- ✅ CDN Ready

## 🚀 النشر

المشروع جاهز للنشر على:
- ✅ Vercel (Frontend)
- ✅ Railway/Heroku (Backend)
- ✅ AWS/DigitalOcean (Self-hosted)

## 📝 الترخيص

MIT License - انظر [LICENSE](./LICENSE) للتفاصيل

## 👨‍💼 المالك

**Peter Shukry**
- GitHub: [@shukrypeter79-max](https://github.com/shukrypeter79-max)
- WhatsApp: https://wa.me/c/201055655649

## 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة [Contributing Guide](./CONTRIBUTING.md) أولاً.

## 📞 التواصل

- 📧 Email: support@pmcosmetics.com
- 💬 WhatsApp: https://wa.me/c/201055655649
- 🌐 Website: (قريباً)

---

**آخر تحديث**: 2026-08-11
**الحالة**: تحت التطوير 🚀
