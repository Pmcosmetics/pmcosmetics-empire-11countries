# 🔗 إعداد المنصات المتعددة - Multi-Platform Setup

## 1️⃣ WooCommerce (المركز الرئيسي)

### الإعدادات المطلوبة:

```env
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxx
WOOCOMMERCE_SYNC_ENABLED=true
WOOCOMMERCE_BATCH_SIZE=50
```

### خطوات التثبيت:

1. **إنشاء مفاتيح API:**
   - اذهب إلى: Settings > Advanced > REST API
   - اضغط: Create an API key
   - الصلاحيات: Read/Write Products, Orders

2. **اختبار الاتصال:**
```bash
node scripts/test-woocommerce-connection.mjs
```

3. **بدء المزامنة:**
```bash
node scripts/sync-to-woocommerce.mjs
```

---

## 2️⃣ Shopify (الواجهة الأمامية)

### الإعدادات المطلوبة:

```env
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_API_VERSION=2024-01
```

### خطوات التثبيت:

1. **إنشاء تطبيق مخصص:**
   - اذهب إلى: Settings > Apps and integrations
   - اضغط: Develop apps
   - اختر: Admin API scopes
   - فعّل: write_products, read_inventory

2. **نسخ التوكن:**
```bash
echo "SHOPIFY_ACCESS_TOKEN=" > .env
```

3. **اختبار:**
```bash
node scripts/test-shopify-connection.mjs
```

---

## 3️⃣ Noon (المنصة العربية)

### الإعدادات المطلوبة:

```env
NOON_API_URL=https://api.noon.partners
NOON_API_KEY=your_api_key
NOON_SELLER_ID=your_seller_id
NOON_SANDBOX_MODE=false
```

### خطوات التثبيت:

1. **التسجيل كبائع:**
   - اذهب إلى: https://seller.noon.com
   - أكمل التحقق

2. **الحصول على بيانات API:**
   - الذهاب إلى: Settings > API Keys
   - نسخ: API Key و Seller ID

3. **تحميل المنتجات:**
```bash
node scripts/sync-to-noon.mjs
```

---

## 4️⃣ Instagram Shop

### الإعدادات المطلوبة:

```env
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_token
FACEBOOK_CATALOG_ID=your_catalog_id
```

### الخطوات:

1. تحويل الحساب إلى Business Account
2. ربط Facebook Page
3. إنشاء Product Catalog
4. إضافة المنتجات

---

## 5️⃣ WhatsApp Business

### الإعدادات المطلوبة:

```env
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_BUSINESS_ACCESS_TOKEN=your_token
WHATSAPP_WEBHOOK_SECRET=your_secret
WHATSAPP_BUSINESS_VERIFY_TOKEN=your_verify_token
```

### الخطوات:

1. إنشاء حساب WhatsApp Business
2. التحقق من الرقم
3. إعداد الـ Webhook
4. تفعيل Catalog

---

## ✅ قائمة التحقق

- [ ] WooCommerce متصل وجاهز
- [ ] Shopify متصل وجاهز
- [ ] Noon متصل وجاهز
- [ ] Instagram Shop جاهز
- [ ] WhatsApp Business جاهز
- [ ] جميع المنصات تم اختبارها
- [ ] جميع بيانات الاعتماد محفوظة بأمان

---

## 🔐 أمان بيانات الاعتماد

**قاعدة ذهبية:**
- ❌ لا تحفظ بيانات الاعتماد في Git
- ✅ استخدم متغيرات البيئة فقط
- ✅ استخدم Railway/Vercel Secret Storage
- ✅ استخدم .env.local

```bash
# في Railway:
railway link
railway env add WOOCOMMERCE_URL https://...
railway env add WOOCOMMERCE_CONSUMER_KEY ck_...
```
