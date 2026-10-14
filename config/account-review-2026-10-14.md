# مراجعة الحسابات والتكاملات — 2026-10-14

مراجعة للقراءة فقط. لم يُعدَّل أي ملف هوية أو صلاحيات أو بوابة نشر.

## الحسابات الأربعة

| الحساب | الدور المعلن | التكاملات الموثقة |
|---|---|---|
| shukrypeter79@gmail.com | المالك الأساسي للتجارة والتصميم | Shopify (متصل محليًا)، Figma (متحقق)، Facebook عبر Windsor، Supabase |
| shukrypeter102@gmail.com | الهندسة والتشغيل الثانوي | GitHub (متحقق)، Notion (متحقق)، Windsor.ai، Railway |
| shukrypeter72@gmail.com | نسخة احتياطية | عضو في Notion فقط |
| petershukry67@gmail.com | نسخة احتياطية | عضو في Notion فقط |

## تعارضات تحتاج قرارًا

1. ~~**الحساب الأساسي غير متفق عليه**~~ — **محسوم:** 79 هو الأساسي (قرار المالك). انظر "القرار" أدناه.
2. **Railway:** سجل Gmail ينسبه إلى 102، ولا يحدده الملف الموحد.
3. **Facebook وWindsor:** سجل Gmail ينسب Facebook إلى 79، ومصفوفة الحسابات تنسب Windsor إلى 102.
4. **Shopify:** معلّم "connected_verified" في `store-platform-account-registry` و`gmail-registration-hub`، لكن `live-windsor-status-2026-10-05.json` يقول إن تفويضه في Windsor ما زال معلقًا. الوصف الأدق: متصل محليًا، وتفويض Windsor معلق.
5. **Gmail غير متحقق مباشرة:** موصل Gmail معطل من المسؤول، فحالة الحسابات مأخوذة من الملفات فقط.

## التكاملات المعلقة

- **تفويض OAuth:** Instagram وTikTok وTikTok Shop وAmazon SP وGoogle Merchant وSnapchat (`authorization_required`).
- **بيانات اعتماد:** WooCommerce وWordPress وTelegram.
- **تفويض بائع أو شريك:** Etsy وTemu وNoon وJumia وSalla وTalabat وOLX/Dubizzle.
- **غير متاح كموصل:** WhatsApp Cloud API وEtsy في Windsor.

## الحالة الحالية

- بوابة النشر التجاري: **مغلقة**.
- المنتجات الجاهزة للنشر: 1 (DERMAELLE007)، والمحجوبة: 73.

## حالة الملفات الثلاثة بعد التوحيد

- `gmail-registration-hub-2026-10-03.json`: متوافق. `primary` = 79، و`roleAssignment` يحدد 79 كـ primary.
- `account-integration-matrix.json`: متوافق. 79 هو `commerce-and-design-primary`.
- `store-platform-account-registry.json`: عُدّل. 79 هو الوحيد في `primaryEmails`، و102 في `secondaryEmails`.

عُدّل `gmail-registration-hub` ليجعل 79 مالك GitHub وRailway وبقية القنوات. الحساب الفعلي الذي يملك هذه الخدمات قد يكون 102، ويحتاج تأكيدًا من الخدمات نفسها.

## القرار

- الحساب الأساسي: **shukrypeter79@gmail.com** (قرار المالك).
- الحساب الثانوي: shukrypeter102@gmail.com.
- عُدّل `store-platform-account-registry.json` ليطابق القرار: 79 أولًا وحده في `primaryEmails`، و102 في `secondaryEmails`.
- الملفات الأخرى كانت تحمل 79 أساسيًا أصلًا.
- ملف `gmail-registration-hub` يُظهر مالك GitHub وRailway على 79 بحسب القرار، لكن الحساب الفعلي المالك لهذه الخدمات لم يُتحقق منه، وقد يكون 102.
- التوحيد على الرقم 01055655649 في ملفات `config`.
