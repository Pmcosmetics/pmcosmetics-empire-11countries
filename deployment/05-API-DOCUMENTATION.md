# 📚 توثيق API الكاملة - Complete API Documentation

## 🏥 Health & Status Endpoints

### 1. Health Check
```bash
GET /api/health

Response:
{
  "ok": true,
  "service": "pmcosmetics-empire-11countries",
  "gate": "CLOSED" or "OPEN",
  "runtime": "Vercel/Railway",
  "dataSource": "Supabase",
  "architecture": [...]
}
```

### 2. Readiness Check
```bash
GET /api/readiness

Response:
{
  "ok": true,
  "mode": "CONTROLLED_PILOT" or "COMMERCIAL",
  "commercialWrites": "LOCKED" or "GATE_OPEN",
  "marketScope": { "count": 11 },
  "layers": { ... }
}
```

---

## 📦 Product Endpoints

### 1. List Products
```bash
GET /api/products

Response:
{
  "ok": true,
  "gate": "CLOSED",
  "source": "Supabase",
  "readOnly": true,
  "products": [...]
}
```

### 2. Bulk Import
```bash
POST /api/products/bulk/import
Content-Type: application/json

Body:
{
  "products": [
    {
      "sku": "PM-001",
      "name": "Rose Lipstick",
      "priceUSD": 24.99,
      "stock": 150,
      "images": ["url1", "url2"],
      "markets": ["EG", "SA", "AE"]
    }
  ]
}

Response:
{
  "ok": true,
  "imported": 1,
  "errors": 0,
  "location": "data/products/imported.json"
}
```

### 3. Get Staging Products
```bash
GET /api/products/staging

Response:
{
  "ok": true,
  "publishable": false,
  "source": "Airtable",
  "feed": "/data/products/staging-evidence.json"
}
```

---

## 🔄 Synchronization Endpoints

### 1. Batch Readiness
```bash
POST /api/products/batch/readiness
Content-Type: application/json

Body:
{
  "products": [
    {
      "sku": "PM-001",
      "provenanceVerified": true,
      "imageVerified": true,
      "authorizationVerified": true
    }
  ]
}

Response:
{
  "ok": true,
  "mode": "EVIDENCE_AWARE_BATCH",
  "inputCount": 1,
  "eligibleCount": 1,
  "blockedCount": 0,
  "publishableNow": false
}
```

### 2. Batch Publish
```bash
POST /api/products/batch/publish
Content-Type: application/json

Body:
{
  "dryRun": true,
  "products": [...],
  "channel": "woocommerce"
}

Response:
{
  "ok": true,
  "dryRun": true,
  "gate": "CLOSED",
  "eligibleCount": 1,
  "blockedCount": 0
}
```

---

## 🛒 WooCommerce Integration

### 1. Status
```bash
GET /api/woocommerce/status

Response:
{
  "ok": true,
  "configured": true,
  "enabled": true,
  "api": "https://your-store/wp-json/wc/v3"
}
```

### 2. Sync Products
```bash
POST /api/woocommerce/sync
Content-Type: application/json

Body:
{
  "dryRun": true,
  "products": [...]
}

Response:
{
  "ok": true,
  "dryRun": true,
  "validCount": 100,
  "duplicateSkuCount": 5,
  "createCount": 100,
  "updateCount": 0
}
```

---

## 💬 WhatsApp Integration

### 1. Status
```bash
GET /api/whatsapp/status

Response:
{
  "ok": true,
  "gate": "CLOSED",
  "webhook": {
    "configured": true,
    "path": "/api/whatsapp/webhook"
  },
  "routing": {
    "primary": "https://wa.me/201055655649",
    "backup": "https://wa.me/201203151461",
    "catalog": "https://wa.me/c/201055655649"
  }
}
```

### 2. Webhook Verification
```bash
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=CHALLENGE

Response: CHALLENGE
```

### 3. Webhook Events
```bash
POST /api/whatsapp/webhook
Content-Type: application/json
X-Hub-Signature-256: sha256=...

Body:
{
  "object": "whatsapp_business_account",
  "entry": [...]
}

Response:
{
  "ok": true,
  "received": true,
  "processed": false,
  "reason": "WEBHOOK_RECEIVED_GATED"
}
```

---

## 🎯 Manus Catalog

### 1. Status
```bash
GET /api/manus/status

Response:
{
  "ok": true,
  "configured": true,
  "enabled": true,
  "maxProducts": 10000,
  "source": "https://manus-endpoint.example"
}
```

### 2. Import
```bash
POST /api/manus/import
Content-Type: application/json

Body:
{
  "products": [...]
}

Response:
{
  "ok": true,
  "source": "Manus",
  "sourceCount": 100,
  "validCount": 95,
  "invalidCount": 5,
  "publishable": false,
  "gate": "CLOSED"
}
```

---

## 📊 Analytics Endpoints

### 1. Amplitude Status
```bash
GET /api/amplitude/status

Response:
{
  "ok": true,
  "configured": false,
  "enabled": false
}
```

---

## 🔐 Error Handling

جميع الأخطاء ترجع كود HTTP مناسب:

```json
{
  "ok": false,
  "gate": "CLOSED",
  "reason": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `503`: Service Unavailable

---

## 🔑 Authentication

جميع المنصات تستخدم:
- **Basic Auth** لـ WooCommerce
- **Bearer Token** لـ Shopify
- **API Key** لـ Noon
- **Webhook Signature** لـ WhatsApp

---

## 📈 Rate Limiting

- **Per Minute:** 60 requests
- **Per Hour:** 1000 requests
- **Per Day:** 10000 requests

---

## 🧪 Testing

```bash
# Full test suite
npm test

# API tests
node scripts/test-api.mjs

# Platform tests
node scripts/test-woocommerce-connection.mjs
node scripts/test-shopify-connection.mjs
node scripts/test-noon-connection.mjs
```
