# 📦 نظام إدراج المنتجات - Product Ingestion System

## كيفية إضافة 1000 منتج في ساعة واحدة

### الطريقة 1: الاستخراج المباشر من Alfouad

```bash
# 1. تشغيل السكريبت
node scripts/alfouad-catalog-scraper.mjs 500

# 2. سيقوم بـ:
# - استخراج 500 منتج
# - تحميل الصور
# - تحويل إلى صيغة PM
# - حفظ في data/products/alfouad-catalog.json
```

### الطريقة 2: الاستيراد من ملف CSV

```bash
# صيغة CSV:
sku,name,nameAr,brand,category,price,stock,images,markets

# مثال:
PM-001,Rose Lipstick,أحمر الشفاه,PM,Makeup,24.99,150,url1|url2,EG,SA,AE

# التشغيل:
node scripts/bulk-product-importer.mjs csv products.csv
```

### الطريقة 3: الاستيراد من JSON

```json
[
  {
    "sku": "PM-001",
    "name": "Rose Lipstick",
    "priceUSD": 24.99,
    "markets": ["EG", "SA", "AE"],
    "images": ["url1", "url2"]
  }
]
```

### الطريقة 4: التحميل المباشر عبر API

```bash
curl -X POST http://localhost:8080/api/products/bulk/import \
  -H "Content-Type: application/json" \
  -d @products.json
```

---

## ✅ التحقق من المنتجات

```bash
# 1. التحقق من جودة البيانات
node scripts/complete-execution.mjs

# 2. سيظهر:
# ✅ المنتجات المعالجة: 500
# ✅ البيانات الصحيحة
# ✅ جاهز للمزامنة
```

---

## 🔄 المزامنة مع المنصات

### Dry-Run (اختبار آمن):
```bash
node scripts/fast-product-sync.mjs --dry-run
```

### المزامنة الحقيقية:
```bash
# WooCommerce
node scripts/fast-product-sync.mjs --woo

# Shopify
node scripts/fast-product-sync.mjs --shopify

# Noon
node scripts/fast-product-sync.mjs --noon

# الكل معاً
node scripts/fast-product-sync.mjs --all
```

---

## 📊 المراقبة

```bash
# مراقبة سجلات المزامنة
tail -f sync-logs/*.json

# عرض ملخص الأداء
node scripts/monitor.mjs
```
