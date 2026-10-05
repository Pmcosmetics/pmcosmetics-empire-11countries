# PM COSMETICS HUB — خطة إغلاق تنفيذية للنشر الجماعي والتجاري

**تاريخ البدء:** 2026-10-05  
**الهدف النهائي:** فتح Commercial Publish Gate ثم تنفيذ النشر الجماعي على دفعات آمنة ومُتحقق منها.  
**المنتج التجريبي الحالي:** DERMAELLE007  
**الحالة الحالية:** Commercial Publish Gate = CLOSED.

## خطة الإغلاق

| الأولوية | العنصر | المالك | موعد الخروج | شرط الخروج القابل للقياس |
|---|---|---|---|---|
| P0 | تثبيت العدد المرجعي النهائي للـProduct Master | Product Master Owner + QA | 2026-10-05 | مرجع واحد معتمد للعدد الكلي وتوزيع الحالات؛ إزالة التعارض بين staging/ledger/queue؛ commit موثق، وNo conflicting counts في ملفات التشغيل |
| P0 | تثبيت المجلد الرسمي كمصدر الأدلة | Audit/QA Owner | 2026-10-05 | ربط مجلد Drive الرسمي بكل دفعة، وكل دليل يحمل File Reference + Test ID؛ الملفات غير المقروءة تبقى Pending Verification |
| P0 | إغلاق دفعة Identity — 52 سجلًا | Product Master Owner + Procurement/QA | 2026-10-08 | لكل سجل SKU صالح + GTIN صالح + هوية PM دقيقة + رابط أدلة deterministic + QA + evidenceValidated=true؛ لا يبقى أي سجل Identity في الدفعة المستهدفة |
| P0 | إغلاق دفعة Image/Stock — 20 سجلًا | Product Master Owner + Inventory/QA | 2026-10-09 | لكل سجل صورة PM مملوكة + مخزون PM مؤكد >0 + تكلفة/Provenance + Authorization عند اللزوم + QA + evidenceVerified=true + publishable=true |
| P0 | إعادة فحص DERMAELLE007 بعد أي تغييرات | Product QA + Inventory Owner | 2026-10-05 | SKU/GTIN/identity/image/stock/cost/authorization متطابقة؛ لا drift؛ يظل Publish-Ready |
| P1 | تفويض القنوات المؤهلة | Channel Owners + Integration Engineer | 2026-10-10 | لكل قناة مستهدفة: provider authorization verified، identifiers صحيحة، credentials خارج Git، ولا permission errors |
| P1 | اختبار القنوات الشامل | QA + Integration Engineer | 2026-10-11 | Authorization + Catalog + Sync + Reconciliation + Rollback = PASS؛ critical FAIL = 0 لكل قناة قبل اعتمادها |
| P1 | مطابقة الأسعار/العملات | Pricing Owner + Finance/QA | 2026-10-11 | لكل قناة سعر مستهدف معتمد؛ EGP لا يُكتب كـUSD؛ price drift = 0 عن السعر المعتمد للدفعة |
| P1 | مطابقة المخزون والطلبات | Inventory Owner + Integration Engineer | 2026-10-11 | stock reconciliation PASS؛ لا overwrite غير مصرح؛ order read/sync test PASS للقنوات التي تدعم الطلبات |
| P1 | حزمة الاعتماد النهائية | QA Lead + Channel Owners | 2026-10-12 | 100% من الأدلة المطلوبة موجودة، كل test ID له نتيجة PASS، كل قناة لها owner + timestamp + sign-off |
| P0 | فتح Commercial Publish Gate | Commerce Owner + QA Lead | 2026-10-12 | لا تُفتح البوابة إلا إذا: Product batch eligibility PASS + channel acceptance PASS + rollback PASS + evidence coverage = 100% |
| P0 | النشر الجماعي — الدفعة الأولى | Release Manager + Integration Engineer | 2026-10-13 | نشر فقط للمنتجات التي تحقق Publish-Ready؛ batch size محدود ومُسجل؛ unintended publications = 0؛ write errors = 0 |
| P1 | التحقق بعد النشر | QA + Inventory + Channel Owners | 2026-10-13 | كل منتج منشور يطابق PM في SKU/GTIN/price/stock/image/status؛ reconciliation PASS |
| P1 | التوسع للدفعات التالية | Release Manager | 2026-10-14 onward | كل دفعة لاحقة تمر بنفس acceptance gate؛ لا يتم التوسع عند أي discrepancy؛ rollback متاح قبل كل دفعة |

## بوابة منع الإطلاق

يظل النشر الجماعي **ممنوعًا** إذا تحقق واحد من الآتي:
- أي تعارض غير محسوم في أرقام Product Master.
- أي منتج في الدفعة لا يحقق Publish-Ready.
- أي قناة غير مفوضة أو غير مختبرة.
- أي سعر أو عملة غير معتمدة.
- أي stock drift غير مفسر.
- أي فشل أمني أو webhook/signature/consent.
- أي rollback test غير ناجح.

## تعريف الخروج النهائي

لا نعتبر المشروع مكتملًا تجاريًا إلا عند:
**Product Evidence 100% للدفعة → Channel Authorization → Sync PASS → Reconciliation PASS → Rollback PASS → Final Sign-off → Commercial Publish Gate OPEN → Batch Publish → Post-Publish Verification**

### المراجع الرسمية

- Official Drive folder: https://drive.google.com/drive/folders/1eTlPxA3hBxnNO7aR6qFo70qqRKCjpriY
- Official audit document: https://docs.google.com/document/d/1FaHM39qff5ogJIKKUY7_JHqerAX-_9MJFcvabFa7Geo/edit?usp=sharing
- Official audit sheet: https://docs.google.com/spreadsheets/d/1YsiY5xemo2ssz4_hzjFeFErkbSAM7KfbrTxVTOPbZ28/edit?usp=sharing
- Execution queue: config/product-master-remediation-queue-2026-10-05.json

**ملاحظة تشغيلية:** حالة الـqueue الحالية في الملف المعتمد هي 52 Identity + 20 Image/Stock ضمن 73 سجلًا، مع 1 Publish-Ready. يجب تثبيت هذا الرقم مقابل بقية snapshots قبل فتح البوابة.
