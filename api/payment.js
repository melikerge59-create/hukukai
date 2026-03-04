const crypto = require('crypto');

const API_PATH = '/payment/iyzipos/checkoutform/initialize/auth/ecom';

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

  const { plan, userEmail, userName, userId } = req.body;
  const planPrices = { plus: '99.00', pro: '349.00', elite: '799.00' };
  const price = planPrices[plan];
  if (!price) return res.status(400).json({ error: 'Gecersiz plan' });

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!apiKey || !secretKey) return res.status(500).json({ error: 'API key eksik' });

  const rnd = String(process.hrtime()[0]) + Math.random().toString(36).slice(2);

  const buyer = {
    id: String(userId || 'user1').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 36) || 'user1',
    name: (userName || 'Ad').split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Ad',
    surname: ((userName || 'Ad Soyad').split(' ').slice(1).join(' ')).replace(/[^a-zA-Z]/g, '') || 'Soyad',
    email: userEmail || 'test@hukukai.com',
    identityNumber: '11111111111',
    registrationAddress: 'Istanbul',
    city: 'Istanbul',
    country: 'Turkey',
    ip: (req.headers['x-forwarded-for'] || '85.34.78.112').split(',')[0].trim()
  };

  const body = {
    locale: 'tr',
    conversationId: buyer.id.substring(0, 36),
    price: price,
    paidPrice: price,
    currency: 'TRY',
    basketId: 'bsk' + Date.now(),
    paymentGroup: 'SUBSCRIPTION',
    callbackUrl: 'https://hukukai-mu.vercel.app/api/payment-callback',
    enabledInstallments: [1, 2, 3],
    buyer: buyer,
    shippingAddress: { contactName: buyer.name + ' ' + buyer.surname, city: 'Istanbul', country: 'Turkey', address: 'Istanbul' },
    billingAddress: { contactName: buyer.name + ' ' + buyer.surname, city: 'Istanbul', country: 'Turkey', address: 'Istanbul' },
    basketItems: [{ id: plan, name: 'HukukAI ' + plan + ' Plan', category1: 'Yazilim', itemType: 'VIRTUAL', price: price }]
  };

  const auth = generateAuth(apiKey, secretKey, rnd, body);
  console.log('KEY:', apiKey.substring(0, 15), '| RND:', rnd);

  try {
    const resp = await fetch('https://sandbox-api.iyzipay.com' + API_PATH, {
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
    console.log('IYZICO:', text);

    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: 'Parse hatasi', raw: text }); }

    if (data.status !== 'success') {
      return res.status(500).json({ error: data.errorMessage || 'Odeme baslatildi', errorCode: data.errorCode });
    }

    return res.status(200).json({ checkoutFormContent: data.checkoutFormContent, token: data.token });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
