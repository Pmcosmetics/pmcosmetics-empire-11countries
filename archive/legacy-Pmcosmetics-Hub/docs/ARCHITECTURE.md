# 🏗️ هندسة المشروع - PM.Cosmetics

## نظرة عامة على المعمارية

المشروع يتبع نمط **Monorepo** باستخدام **Turbo** وينقسم إلى:

```
pmcosmetics/
├── apps/
│   ├── web/           # Next.js Frontend
│   ├── api/           # Express Backend
│   └── mobile/        # React Native App
├── packages/
│   ├── database/      # Prisma ORM
│   ├── ui/            # UI Components Library
│   ├── common/        # Shared Types
│   └── api-client/    # API Client
└── docs/              # Documentation
```

## 📊 معمارية الطلب

```
┌──────────────────────┐
│ React App / Mobile   │
├──────────────────────┤
│   Frontend Layer     │
└──────────┬───────────┘
           │ HTTP/REST
┌──────────▼───��───────┐
│ Express API Gateway  │
├──────────┬───────────┤
│  Backend Layer       │
└──────────┬───────────┘
           │ SQL
┌──────────▼───────────┐
│ PostgreSQL Database  │
├──────────────────────┤
│ Data Persistence     │
└──────────────────────┘
```

## 🔄 دورة حياة الطلب

### 1. Frontend
- المستخدم يتفاعل مع الواجهة
- React يرسل طلب HTTP إلى API
- المكتبة `axios` تتولى اتصال الشبكة

### 2. API Gateway
- Express يستقبل الطلب
- Middleware تتحقق من المصادقة
- Router توجه الطلب للمتحكم المناسب

### 3. Controller (المتحكم)
- التحقق من صحة البيانات
- معالجة المنطق التجاري
- استدعاء قاعدة البيانات عبر Prisma

### 4. Database
- تنفيذ الاستعلام
- إرجاع النتائج
- تحديث الكاش (Redis)

### 5. Response
- إرجاع JSON للـ Frontend
- تحديث حالة التطبيق
- عرض النتائج للمستخدم

## 📋 هندسة قاعدة البيانات

### المجموعات الرئيسية

#### 1. المستخدمون والمصادقة
```
User
├── id (PK)
├── email (UNIQUE)
├── phone (UNIQUE)
├── password (hashed)
├── role (CUSTOMER, SELLER, ADMIN)
└── related: Address[], Order[], Review[]
```

#### 2. المتاجر والبيع
```
Store
├── id (PK)
├── ownerId (FK → User)
├── name
├── storeType (RETAIL, WHOLESALE, BOTH)
└── related: Product[], Order[]
```

#### 3. المنتجات
```
Product
├── id (PK)
├── storeId (FK → Store)
├── categoryId (FK → Category)
├── price, retailPrice, wholesalePrice
├── stock, reserved
└── related: ProductImage[], Review[], OrderItem[]
```

#### 4. الطلبات
```
Order
├── id (PK)
├── userId (FK → User)
├── storeId (FK → Store)
├── status (PENDING, CONFIRMED, SHIPPED, DELIVERED)
├── paymentStatus, shippingStatus
└── related: OrderItem[], Payment[], Shipment[]
```

#### 5. الدفع
```
Payment
├── id (PK)
├── orderId (FK → Order)
├── method (CREDIT_CARD, PAYPAL, etc)
├── status (PENDING, COMPLETED, FAILED)
└── gateway (stripe, paypal)
```

## 🔐 الأمان

### طبقات الأمان

1. **Authentication (المصادقة)**
   - JWT Tokens (7 أيام)
   - bcryptjs لتشفير كلمات المرور

2. **Authorization (التفويض)**
   - Role-based Access Control (RBAC)
   - User ID validation

3. **Data Validation**
   - Joi/Zod للتحقق من البيانات
   - SQL Injection prevention

4. **API Security**
   - CORS protection
   - Rate limiting
   - HTTPS (في الإنتاج)

## 📈 التوسعية

### Caching Strategy
```
┌──────────────────┐
│   Browser        │ ← Cache (Service Worker)
└──────────┬───────┘
           │
┌──────────▼──────────┐
│  API Server          │ ← Redis Cache
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ PostgreSQL           │
└──────────────────────┘
```

### Database Optimization
- Indexes على الأعمدة المستخدمة بكثرة
- Connection pooling
- Query optimization
- Pagination للنتائج الكبيرة

## 🚀 النشر

### البيئات

**Development**
```bash
npm run dev
```

**Production**
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t pmcosmetics .
docker run -p 3001:3001 pmcosmetics
```

## 📊 المراقبة والـ Logging

### Logging Levels
- `DEBUG`: معلومات تفصيلية
- `INFO`: أحداث مهمة
- `WARN`: تحذيرات
- `ERROR`: أخطاء

### Monitoring
- API response times
- Database query performance
- Error rates
- User activity logs

## 🔄 CI/CD

### GitHub Actions Workflow
```
Push → Lint → Test → Build → Deploy
```

### Automated Checks
- TypeScript compilation
- ESLint validation
- Unit tests
- Integration tests

## 📦 هيكل الملفات

### Frontend (apps/web)
```
web/
├── app/
│   ├── page.tsx          # Homepage
│   ├── shop/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── FilterSidebar.tsx
└── public/
```

### Backend (apps/api)
```
api/
├── src/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── payments.ts
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   └── app.ts
├── .env.example
└── package.json
```

### Database (packages/database)
```
database/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── src/
    └── index.ts
```

## 🎯 الأداء

### استراتيجيات التحسين

1. **Frontend**
   - Code splitting
   - Image optimization
   - Lazy loading
   - Service Workers

2. **Backend**
   - Database indexing
   - Query optimization
   - Caching
   - Connection pooling

3. **Database**
   - Normalization
   - Partitioning
   - Vacuum operations

## 🧪 الاختبار

### أنواع الاختبارات

1. **Unit Tests**: اختبار الدوال الفردية
2. **Integration Tests**: اختبار التكامل بين الأجزاء
3. **E2E Tests**: اختبار المسارات الكاملة

---

**آخر تحديث**: 2026-08-11
