const express = require('express');
const twilio = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.urlencoded({ extended: false }));

const {
  PORT = 3000,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  TWILIO_AUTH_TOKEN,
  TWILIO_VALIDATE_SIGNATURE = 'true'
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

function makeOrderId() {
  const d = new Date();
  const day = d.toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${day}-${Date.now().toString().slice(-6)}`;
}

function validTwilioRequest(req) {
  if (TWILIO_VALIDATE_SIGNATURE !== 'true') return true;
  if (!TWILIO_AUTH_TOKEN) return false;
  const signature = req.header('X-Twilio-Signature');
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  return twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, req.body);
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'pmcosmetics-whatsapp-webhook' }));

app.post('/whatsapp', async (req, res) => {
  if (!validTwilioRequest(req)) return res.status(403).send('Forbidden');

  const body = String(req.body.Body || '').trim();
  const from = String(req.body.From || '').trim();
  const messageSid = String(req.body.MessageSid || '').trim();
  const timestamp = new Date().toISOString();

  if (!supabase) return res.status(500).send('Server configuration error');

  const order = {
    order_id: makeOrderId(),
    customer_name: null,
    phone: from.replace(/^whatsapp:/, ''),
    status: 'pending',
    source: 'whatsapp',
    wa_message: body,
    wa_timestamp: timestamp,
    metadata: { message_sid: messageSid, to: req.body.To || null }
  };

  const { error } = await supabase.from('orders').insert(order);
  if (error) {
    console.error('Supabase insert failed:', error);
    return res.status(500).send('Database error');
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message('شكرًا لاختيارك PM Cosmetics HuB — استلمنا رسالتك وفتحنا طلبًا مبدئيًا. نرجو إرسال الاسم والعنوان والكمية وطريقة الدفع، وسيؤكد فريقنا الطلب.');
  res.type('text/xml').send(twiml.toString());
});

app.listen(PORT, () => console.log(`Webhook listening on ${PORT}`));
