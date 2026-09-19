# PM Cosmetics HuB — Orders SOP (Manual MVP)

## Order statuses
`pending` → `confirmed` → `paid` → `shipped` → `delivered`  
Cancellation: `cancelled`

## Intake
1. Receive the WhatsApp order.
2. Create the next `order_id` (for example `ORD-20260903-001`).
3. Record product ID, product name, quantity, price, customer name, phone, address, payment method, source, WhatsApp message and timestamp in `orders.csv`.
4. Reply within 5–15 minutes requesting any missing name, address, quantity or payment method.
5. Confirm total cost and shipping with the customer; set `status=confirmed`.
6. When payment is received, set `status=paid`.
7. When handed to the courier, set `status=shipped` and record courier/tracking in `notes`.
8. On successful delivery, set `status=delivered`.

## First-response template
> شكرًا لاختيارك PM Cosmetics HuB — استلمنا طلبك. نرجو تأكيد الاسم والعنوان والكمية وطريقة الدفع (الدفع عند الاستلام / تحويل / دفع إلكتروني).

## Shipping template
> طلبك {order_id} تم شحنه عبر {courier} — رقم التتبع: {tracking}.

## Required fields
`order_id,date,time,product_id,product_name,quantity,price_pm,currency,customer_name,phone,address,payment_method,status,notes,source,wa_message,wa_timestamp`

## 48-hour MVP rule
Keep one source of truth (`orders.csv`) and update status immediately after every customer/order event.
