# PM Cosmetics HuB — Orders Admin

لوحة متابعة الطلبات تعمل على GitHub Pages وتقرأ الطلبات الفعلية من Supabase عبر جلسة دخول. **لا تستخدم `orders.csv` العام كمخزن للبيانات الحقيقية.**

## الوصول

بعد نشر GitHub Pages من `main`/`pages` تكون اللوحة تحت:

`/admin/`

الرابط المتوقع:

`https://Pmcosmetics.github.io/Pm/pages/admin/`

## الوظائف

- تسجيل الدخول عبر GitHub OAuth.
- عرض الطلبات من جدول `public.orders` بعد المصادقة.
- البحث برقم الطلب/المنتج/الحالة.
- فلترة حسب الحالة.
- تحديث البيانات.
- تحديث حالة الطلب من خلال RPC آمن (`update_order_status`).
- فتح واتساب من رقم العميل عند توفره.
- تسجيل الخروج.

## Supabase — الإعداد

1. أنشئ مشروع Supabase.
2. طبّق migrations بالترتيب، ومنها:
   - `supabase/migrations/001_orders.sql`
   - `supabase/migrations/002_admin_users_and_policies.sql`
3. أنشئ مستخدمًا في Supabase Auth عبر GitHub OAuth.
4. أضف `user_id` الخاص به إلى `public.admin_users` مع role=`admin` أو `staff`.
5. في GitHub OAuth App اجعل **Authorization callback URL** هو callback الخاص بمشروع Supabase:
   `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
6. في Supabase Auth / URL Configuration أضف رابط لوحة GitHub Pages إلى **Redirect URLs**:
   `https://Pmcosmetics.github.io/Pm/pages/admin/`
7. انسخ `pages/admin/config.example.js` إلى `pages/admin/config.js`، ثم ضع Supabase Project URL وPublishable/anon key.

> مفتاح Publishable/anon يمكن استخدامه في المتصفح عند حماية البيانات بـ RLS. **ممنوع تمامًا** وضع `SUPABASE_SERVICE_ROLE_KEY` في `config.js` أو أي ملف يصل إلى المتصفح.

## نموذج الصلاحيات

- `admin_users` يحدد المستخدمين المصرح لهم ودورهم (`admin` / `staff`).
- قراءة الطلبات متاحة فقط للمستخدمين المصرح لهم.
- الإدخال والتحديث المباشر من المتصفح ليسا صلاحية عامة.
- تحديث الحالة/الملاحظات يتم عبر `update_order_status` للمستخدم المصرح له.
- Webhook يستخدم `service_role` على الخادم فقط لإدخال الطلبات القادمة من واتساب.

## دورة الحالة

`pending → confirmed → paid → shipped → delivered`

والإلغاء: `cancelled`.

## قاعدة أمان مهمة

GitHub Pages موقع عام، لذلك **لا تُدخل بيانات العملاء الحقيقية (الاسم، الهاتف، العنوان، رسائل واتساب) في `orders.csv`**. الملف العام يبقى قالبًا/بيانات اختبار فقط.

مصدر الحقيقة للطلبات الفعلية هو Supabase الخاص، واللوحة لا تعرض بياناته إلا بعد المصادقة وتطبيق RLS.

## التشغيل

1. استقبل الطلب على واتساب.
2. Webhook ينشئ الطلب المبدئي في Supabase باستخدام service role على الخادم.
3. فريق الإدارة يدخل لوحة `/admin/` بحساب GitHub مصرح له.
4. راجع الطلب وحدّث الحالة.
5. عند الشحن: حدّث الحالة إلى `shipped` وسجّل بيانات الشحن في الملاحظات/النظام المناسب.
6. عند التسليم: حوّل الحالة إلى `delivered`.

## ملاحظة Go-Live

هذه النسخة تنقل واجهة الإدارة من CSV العام إلى Supabase Auth + RLS، لكنها **لن تعمل فعليًا قبل إعداد `config.js`، GitHub OAuth، Supabase migrations، وإضافة أول admin إلى `admin_users`**.

لا يتم تخزين customer PII في GitHub Pages أو `orders.csv` العام.
