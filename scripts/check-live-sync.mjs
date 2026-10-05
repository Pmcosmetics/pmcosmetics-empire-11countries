#!/usr/bin/env node

/**
 * Live Railway -> Product Master sync gate for DERMAELLE007.
 *
 * Usage:
 *   RAILWAY_URL=https://... EMPIRE_ACCESS_TOKEN=... npm run check:live-sync
 *
 * The script never changes data. It only reads public endpoints and the
 * authenticated readiness endpoint, then exits 0 on a full PASS and 1 on FAIL.
 */

const BASE_URL = String(
  process.env.RAILWAY_URL ||
  "https://pmcosmetics-empire-11countries-production.up.railway.app"
).replace(/\/+$/, "");

const TOKEN = String(
  process.env.EMPIRE_ACCESS_TOKEN ||
  process.env.EMPIRE_AUTH_TOKEN ||
  ""
).trim();

const EXPECTED = {
  sku: "DERMAELLE007",
  gtin: "6223007905060",
  price: "239",
  stock: "48",
  productStatus: "Publish-Ready",
  commercialGate: "CLOSED",
  oldMessage: "لا توجد حاليًا منتجات تحمل حالة"
};

const TIMEOUT_MS = Number(process.env.LIVE_CHECK_TIMEOUT_MS || 15000);

const checks = [];

function record(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: String(detail || "") });
}

async function get(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(BASE_URL + path, {
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      ...options,
      headers: {
        Accept: "application/json, text/html;q=0.9, */*;q=0.8",
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      // Non-JSON response; caller can inspect text.
    }
    return { response, text, json };
  } finally {
    clearTimeout(timer);
  }
}

function has(text, needle) {
  return String(text).includes(needle);
}

async function main() {
  console.log("\nPM COSMETICS HUB — LIVE RAILWAY SYNC CHECK");
  console.log("=".repeat(60));
  console.log("Target:", BASE_URL);
  console.log("Product:", EXPECTED.sku);
  console.log("Expected:", `${EXPECTED.gtin} | ${EXPECTED.price} EGP | ${EXPECTED.stock} units`);
  console.log("");

  let home;
  try {
    home = await get("/");
    record(
      "01 الصفحة الرئيسية متاحة",
      home.response.status === 200,
      `HTTP ${home.response.status}`
    );
  } catch (error) {
    record("01 الصفحة الرئيسية متاحة", false, error?.message || error);
  }

  if (home?.response?.status === 200) {
    record(
      "02 DERMAELLE007 ظاهر في الواجهة",
      has(home.text, EXPECTED.sku),
      has(home.text, EXPECTED.sku) ? "تم العثور على SKU" : "SKU غير موجود"
    );
    record(
      "03 GTIN مطابق",
      has(home.text, EXPECTED.gtin),
      has(home.text, EXPECTED.gtin) ? EXPECTED.gtin : "GTIN غير موجود"
    );
    record(
      "04 السعر مطابق",
      has(home.text, EXPECTED.price + " جنيه") || has(home.text, EXPECTED.price + " جنيه مصري"),
      "المطلوب 239 جنيه"
    );
    record(
      "05 المخزون مطابق",
      has(home.text, EXPECTED.stock + " وحدة"),
      "المطلوب 48 وحدة"
    );
    record(
      "06 حالة المنتج Publish-Ready ظاهرة",
      has(home.text, EXPECTED.productStatus),
      has(home.text, EXPECTED.productStatus) ? "Publish-Ready موجود" : "الحالة غير ظاهرة"
    );
    record(
      "07 الرسالة القديمة اختفت",
      !has(home.text, EXPECTED.oldMessage),
      has(home.text, EXPECTED.oldMessage) ? "الرسالة القديمة ما زالت موجودة" : "الرسالة القديمة غير موجودة"
    );
    record(
      "08 البوابة الجماعية لا تُعرض كمفتوحة",
      has(home.text, "بوابة النشر التجاري الجماعي: ❌ مغلقة"),
      "المطلوب بقاء البوابة مغلقة"
    );
  }

  let health;
  try {
    health = await get("/api/health");
    record(
      "09 /api/health متاح",
      health.response.status === 200 && health.json?.ok === true,
      `HTTP ${health.response.status}`
    );
    record(
      "10 COMMERCIAL_PUBLISH_GATE = CLOSED",
      health.json?.gate === EXPECTED.commercialGate,
      `القيمة الفعلية: ${health.json?.gate ?? "غير معروفة"}`
    );
  } catch (error) {
    record("09 /api/health متاح", false, error?.message || error);
    record("10 COMMERCIAL_PUBLISH_GATE = CLOSED", false, "تعذر قراءة /api/health");
  }

  let readinessAnonymous;
  try {
    readinessAnonymous = await get("/api/readiness");
    record(
      "11 /api/readiness بدون مصادقة يعيد 401",
      readinessAnonymous.response.status === 401,
      `HTTP ${readinessAnonymous.response.status}`
    );
  } catch (error) {
    record("11 /api/readiness بدون مصادقة يعيد 401", false, error?.message || error);
  }

  if (!TOKEN) {
    record(
      "12 /api/readiness بفحص مصادق عليه",
      false,
      "EMPIRE_ACCESS_TOKEN غير مضبوط — يلزم رمز وصول لاختبار استجابة الجاهزية نفسها"
    );
  } else {
    try {
      const readiness = await get("/api/readiness", {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      record(
        "12 /api/readiness مصادق عليه ينجح",
        readiness.response.status === 200 && readiness.json?.ok === true,
        `HTTP ${readiness.response.status}`
      );
      record(
        "13 بوابة الجاهزية = CLOSED",
        readiness.json?.gate === EXPECTED.commercialGate,
        `القيمة الفعلية: ${readiness.json?.gate ?? "غير معروفة"}`
      );
      record(
        "14 الكتابة التجارية = LOCKED",
        readiness.json?.commercialWrites === "LOCKED",
        `القيمة الفعلية: ${readiness.json?.commercialWrites ?? "غير معروفة"}`
      );
    } catch (error) {
      record("12 /api/readiness مصادق عليه ينجح", false, error?.message || error);
      record("13 بوابة الجاهزية = CLOSED", false, "تعذر قراءة الاستجابة المصادق عليها");
      record("14 الكتابة التجارية = LOCKED", false, "تعذر قراءة الاستجابة المصادق عليها");
    }
  }

  let search;
  try {
    search = await get("/api/storefront/search?q=" + encodeURIComponent(EXPECTED.sku));
    const products = Array.isArray(search.json?.products) ? search.json.products : [];
    const match = products.find(
      (product) => String(product?.sku || "").trim() === EXPECTED.sku
    );
    record(
      "15 بحث الكتالوج يعثر على DERMAELLE007",
      Boolean(match),
      match ? "تم العثور على المنتج" : "لم يتم العثور على المنتج"
    );
    if (match) {
      record(
        "16 نتيجة البحث تحمل السعر المعتمد",
        String(match.base_price ?? match.price ?? "").trim() === EXPECTED.price,
        `القيمة الفعلية: ${match.base_price ?? match.price ?? "غير موجودة"}`
      );
    }
  } catch (error) {
    record("15 بحث الكتالوج يعثر على DERMAELLE007", false, error?.message || error);
    record("16 نتيجة البحث تحمل السعر المعتمد", false, "تعذر اختبار نتيجة البحث");
  }

  console.log("\nالتقرير");
  console.log("-".repeat(60));
  for (const check of checks) {
    console.log(`${check.ok ? "✅ PASS" : "❌ FAIL"} | ${check.name} | ${check.detail}`);
  }

  const passed = checks.filter((item) => item.ok).length;
  const failed = checks.length - passed;
  console.log("-".repeat(60));
  console.log(`PASS: ${passed} | FAIL: ${failed}`);

  if (failed === 0) {
    console.log("\n✅ النتيجة النهائية: LIVE SYNC PASS");
    console.log("✅ DERMAELLE007 متطابق مع الواجهة.");
    console.log("✅ الرسالة القديمة مختفية.");
    console.log("✅ بوابة النشر الجماعي CLOSED.");
    process.exitCode = 0;
  } else {
    console.log("\n❌ النتيجة النهائية: LIVE SYNC FAIL");
    console.log("❌ لا تُفتح بوابة النشر التجاري.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\n❌ النتيجة النهائية: LIVE SYNC FAIL");
  console.error(error?.stack || error);
  process.exitCode = 1;
});
