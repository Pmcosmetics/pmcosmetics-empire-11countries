const twilio = require('twilio');

const url = process.env.TEST_WEBHOOK_URL || 'https://example.com/whatsapp';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'test-auth-token';
const params = {
  MessageSid: 'SM00000000000000000000000000000000',
  From: 'whatsapp:+201000000000',
  To: 'whatsapp:+201000000001',
  Body: 'أريد طلب PM-SK-004 1'
};

const signature = twilio.getExpectedTwilioSignature(authToken, url, params);
console.log(JSON.stringify({
  method: 'POST',
  url,
  header: { 'X-Twilio-Signature': signature },
  form: params
}, null, 2));
console.log('\nUse the printed signature as X-Twilio-Signature when testing a matching URL/body.');
