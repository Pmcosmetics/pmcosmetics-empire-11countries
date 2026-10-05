# PM COSMETICS HUB — جدول المتابعة اليومية للإغلاق التنفيذي

**تاريخ المتابعة:** 2026-10-05  
**الهدف:** الوصول إلى Commercial Publish Gate = OPEN ثم تنفيذ النشر الجماعي الآمن.  
**قاعدة:** أي مهمة حرجة بحالة Blocked أو أي عائق غير محلول يمنع الانتقال إلى المرحلة التالية.

| المهمة | المالك | الموعد | الحالة | العائق | الإجراء التالي |
|---|---|---|---|---|---|
| تثبيت رقم Product Master المرجعي | Product Master Owner + QA | 2026-10-05 | **مغلق** | تم حل التعارض في المصدر الحالي؛ 73 = 1 جاهز + 52 هوية + 20 صورة/مخزون | تثبيت الـqueue والمصدر الحاليين كمرجع تنفيذي وعدم إعادة فتح العدّ إلا عند تغيّر المصدر |
| اعتماد مجلد الأدلة الرسمي | Audit/QA Owner | 2026-10-05 | **قيد التنفيذ** | Google Drive/Docs/Sheets غير مقروءة مباشرة من بيئة العمل الحالية | اعتبار الرابط مصدرًا رسميًا معلنًا، وإبقاء أي دليل غير قابل للقراءة Pending Verification حتى إتاحته/رفعه |
| إعادة تحقق DERMAELLE007 | Product QA + Inventory Owner | 2026-10-05 | **جاهز** | لا عائق ظاهر؛ يحتاج reconciliation دوري | تنفيذ فحص SKU/GTIN/الهوية/الصورة/المخزون/التكلفة/Authorization وتسجيل النتيجة |
| إغلاق Identity — الدفعة الحالية | Product Master Owner + Procurement/QA | 2026-10-08 | **مفتوح** | نقص SKU/GTIN/هوية وأدلة ملكية لعدد كبير من السجلات | تنفيذ دفعة Identity-01 ثم الانتقال بالتتابع حتى تصفية كامل طابور Identity |
| إغلاق Image/Stock — الدفعة الحالية | Product Master Owner + Inventory/QA | 2026-10-09 | **مفتوح** | نقص صورة PM والمخزون والتكلفة/المصدر والتفويض لبعض السجلات | جمع الأدلة PM-owned لكل سجل، ثم QA وتعيين `evidenceVerified=true` فقط بعد اكتمالها |
| تفويض القنوات المستهدفة | Channel Owners + Integration Engineer | 2026-10-10 | **مفتوح** | OAuth/API credentials غير مكتملة لعدة قنوات | إكمال authorization قناةً قناة وتسجيل provider status + IDs + credential store evidence |
| اختبار القنوات الشامل | QA + Integration Engineer | 2026-10-11 | **لم يبدأ** | يعتمد على اكتمال التفويض | تشغيل Authorization → Catalog → Sync → Reconciliation → Rollback لكل قناة |
| مراجعة الأسعار والعملات | Pricing Owner + Finance/QA | 2026-10-11 | **لم يبدأ** | بعض القنوات تحتاج target currency موثق | اعتماد سعر/عملة كل قناة وعدم تحويل EGP تلقائيًا إلى USD دون سياسة معتمدة |
| مطابقة المخزون والطلبات | Inventory Owner + Integration Engineer | 2026-10-11 | **لم يبدأ** | يعتمد على نجاح channel sync | اختبار stock/order reconciliation وإيقاف أي overwrite غير مصرح |
| تجهيز Evidence Pack النهائي | QA Lead + Channel Owners | 2026-10-12 | **لم يبدأ** | يعتمد على اكتمال الاختبارات | تجميع كل evidence references + Test IDs + timestamps + owners |
| قرار فتح Commercial Publish Gate | Commerce Owner + QA Lead | 2026-10-12 | **مغلق** | 72 سجلًا غير جاهز + تفويض قنوات غير مكتمل | عدم الفتح قبل 100% من شروط Product/Channel/Rollback للدفعة المستهدفة |
| Batch Publish #1 | Release Manager + Integration Engineer | 2026-10-13 | **محجوز** | بوابة النشر العالمية مغلقة حاليًا | نشر المنتجات Publish-Ready فقط بعد اعتماد Release Gate |
| Post-Publish Verification | QA + Inventory + Channel Owners | 2026-10-13 | **محجوز** | يعتمد على Batch Publish #1 | مقارنة كل SKU/GTIN/price/stock/image/status مع PM بعد النشر |
| التوسع للدفعات التالية | Release Manager | 2026-10-14+ | **محجوز** | يعتمد على نجاح Batch #1 وعدم وجود discrepancies | تكرار نفس البوابة لكل دفعة وعدم التوسع عند أي فشل |

## تعريف الحالات

- **جاهز:** لا توجد عقبة جوهرية ويمكن التنفيذ.
- **قيد التنفيذ:** المهمة بدأت ويوجد عمل مباشر جارٍ.
- **مفتوح:** المهمة لم تُغلق بعد.
- **لم يبدأ:** تنتظر اكتمال dependency.
- **محجوز:** لا يبدأ قبل فتح البوابة السابقة.
- **Blocked:** يوجد عائق يمنع التقدم.

## Daily Go / No-Go

**GO** عندما لا توجد عوائق P0، والدفعة المستهدفة Publish-Ready بالكامل، والقناة المعنية مفوضة ومختبرة.

**NO-GO** عند:
- تعارض Product Master غير محسوم.
- أي منتج غير Publish-Ready داخل الدفعة.
- Authorization غير مكتمل.
- Sync/Reconciliation/rollback فاشل.
- اختلاف غير مفسر في السعر أو المخزون.
- دليل رسمي غير متاح للتحقق في نقطة حرجة.

## التقرير اليومي المطلوب

في نهاية كل يوم تُسجل:
**نسبة الإنجاز → البنود المغلقة → البنود المتعثرة → سبب التعثر → الإجراء التالي → قرار GO/NO-GO**

**Commercial Publish Gate:** CLOSED — 1/73 Publish-Ready فقط؛ 72 سجلًا ما زالت داخل remediation.
