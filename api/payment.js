const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const API_PATH = '/payment/iyzipos/checkoutform/initialize/auth/ecom';

// Use IYZICO_BASE_URL env var; defaults to sandbox for safety.
// Set IYZICO_BASE_URL=https://api.iyzipay.com in Vercel for production.
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

const PLAN_PRICES = { plus: '99.00', pro: '349.00', elite: '799.00' };
const VALID_PLANS = Object.keys(PLAN_PRICES);

function generateAuth(apiKey, secretKey, rnd, body) {
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rnd + API_PATH + JSON.stringify(body))
    .digest('hex');
  const authParams = 'apiKey:' + apiKey + '&randomKey:' + rnd + '&signature:' + signature;
  return 'IYZWSv2 ' + Buffer.from(authParams).toString('base64');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // --- Auth: require a valid Supabase JWT ---
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' });

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: { user }, error: authError } = await sb.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Geçersiz oturum' });

  // --- Input validation ---
  const { plan, userEmail, userName } = req.body;

  if (!plan || !VALID_PLANS.includes(plan)) {
    return res.status(400).json({ error: 'Geçersiz plan. Kabul edilenler: ' + VALID_PLANS.join(', ') });
  }
  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    return res.status(400).json({ error: 'Geçerli bir e-posta adresi gerekli' });
  }
  if (!userName || typeof userName !== 'string' || userName.trim().length < 2) {
    return res.status(400).json({ error: 'Geçerli bir ad-soyad gerekli' });
  }

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!apiKey || !secretKey) return res.status(500).json({ error: 'Ödeme servisi yapılandırılmamış' });

  // Use the authenticated user's ID — never trust userId from request body
  const userId = user.id;
  const price = PLAN_PRICES[plan];
  const rnd = String(process.hrtime()[0]) + Math.random().toString(36).slice(2);

  const nameParts = userName.trim().split(' ');
  const buyerName = (nameParts[0] || 'Ad').replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '') || 'Ad';
  const buyerSurname = (nameParts.slice(1).join(' ') || 'Soyad').replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, '') || 'Soyad';

  const buyer = {
    id: userId.substring(0, 36),
    name: buyerName,
    surname: buyerSurname,
    email: userEmail,
    identityNumber: '11111111111',
    registrationAddress: 'Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    ip: (req.headers['x-forwarded-for'] || '85.34.78.112').split(',')[0].trim()
  };

  const body = {
    locale: 'tr',
    conversationId: userId.substring(0, 36),
    price: price,
    paidPrice: price,
    currency: 'TRY',
    basketId: 'bsk' + Date.now(),
    paymentGroup: 'SUBSCRIPTION',
    callbackUrl: 'https://hukukai-mu.vercel.app/api/payment-callback',
    enabledInstallments: [1, 2, 3],
    buyer: buyer,
    shippingAddress: { contactName: buyerName + ' ' + buyerSurname, city: 'Istanbul', country: 'Turkey', address: 'Istanbul' },
    billingAddress: { contactName: buyerName + ' ' + buyerSurname, city: 'Istanbul', country: 'Turkey', address: 'Istanbul' },
    basketItems: [{ id: plan, name: 'HukukAI ' + plan + ' Plan', category1: 'Yazilim', itemType: 'VIRTUAL', price: price }]
  };

  const auth = generateAuth(apiKey, secretKey, rnd, body);

  try {
    const resp = await fetch(IYZICO_BASE_URL + API_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'x-iyzi-rnd': rnd,
        'x-iyzi-client-version': 'iyzipay-node-2.0.65'
      },
      body: JSON.stringify(body)
    });

    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch (e) {
      console.error('Iyzipay parse error');
      return res.status(500).json({ error: 'Ödeme servisi yanıt hatası' });
    }

    if (data.status !== 'success') {
      return res.status(500).json({ error: data.errorMessage || 'Ödeme başlatılamadı', errorCode: data.errorCode });
    }

    return res.status(200).json({ checkoutFormContent: data.checkoutFormContent, token: data.token });
  } catch (e) {
    console.error('payment.js error:', e.message);
    return res.status(500).json({ error: 'Ödeme servisi geçici olarak kullanılamıyor' });
  }
};
