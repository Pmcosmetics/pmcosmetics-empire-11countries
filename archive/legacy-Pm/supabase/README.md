# Private Orders — Supabase

## 1. Create the project
Create a Supabase project and copy its project URL and publishable key from the Connect/API settings.

## 2. Create the table
Run `migrations/001_orders.sql` in the Supabase SQL Editor.

The `orders` table has RLS enabled. Anonymous users receive no access; authenticated dashboard users can read and update orders.

## 3. Webhook server
The WhatsApp webhook uses the server-only `SUPABASE_SERVICE_ROLE_KEY`. Put it only in the hosting provider's secret/environment settings. Never put it in `pages/` or browser JavaScript.

Required environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VALIDATE_SIGNATURE=true`
- `PORT` (optional)

## 4. Twilio
Deploy `services/whatsapp-webhook`, then configure the WhatsApp sender's incoming-message webhook as:

`https://YOUR-HOST/whatsapp`

Use HTTP POST.

## Security
Twilio signature validation is enabled by default. Do not disable it in production. Do not commit real credentials, customer data, or `.env` files.
