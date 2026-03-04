const crypto = require('crypto');

function generateAuth(apiKey, secretKey, rnd, body) {
  const hashStr = apiKey + rnd + secretKey + body;
  const hash = crypto.createHash('sha256').update(hashStr, 'utf8').digest('base64');
  const authStr = 'apiKey:' + apiKey + '&randomKey:' + rnd + '&signature:' + hash;
  return 'IYZWSv2 ' + Buffer.from(authStr).toString('base64');
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
  if (!price) return res.status(400).json({ error: 'Geçersiz plan: ' + plan });

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return res.status(500).json({ error: 'API anahtarları eksik', apiKey: !!apiKey, secretKey: !!secretKey });
  }

  const rnd = Date.now().toString();
  const safeUserId = String(userId || 'user1').replace(/-/g, '').substring(0, 32) || 'defaultuser';
  const safeName = (userName?.split(' ')[0] || 'Ad').replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, '').substring(0, 30) || 'Ad';
  const safeSurname = (userName?.split(' ').slice(1).join(' ') || 'Soyad').replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ ]/g, '').substring(0, 30) || 'Soyad';

  const requestBody = {
    locale: 'tr',
    conversationId: safeUserId.substring(0, 36),
    price: price,
    paidPrice: price,
    currency: 'TRY',
    basketId: 'bsk' + Date.now(),
    paymentGroup: 'SUBSCRIPTION',
    callbackUrl: 'https://hukukai-mu.vercel.app/api/payment-callback',
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: safeUserId.substring(0, 36),
      name: safeName,
      surname: safeSurname,
      email: userEmail || 'test@hukukai.com',
      identityNumber: '11111111111',
      registrationAddress: 'Merkez Mah. Istanbul',
      city: 'Istanbul',
      country: 'Turkey',
      ip: (req.headers['x-forwarded-for'] || '85.34.78.112').split(',')[0].trim()
    },
    shippingAddress: {
      contactName: (safeName + ' ' + safeSurname).substring(0, 60),
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Merkez Mah. Istanbul'
    },
    billingAddress: {
      contactName: (safeName + ' ' + safeSurname).substring(0, 60),
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Merkez Mah. Istanbul'
    },
    basketItems: [{
      id: plan,
      name: 'HukukAI ' + plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan',
      category1: 'Yazilim',
      itemType: 'VIRTUAL',
      price: price
    }]
  };

  const bodyStr = JSON.stringify(requestBody);
  const auth = generateAuth(apiKey, secretKey, rnd, bodyStr);

  console.log('API KEY (ilk 10):', apiKey?.substring(0, 10));
  console.log('SECRET KEY (ilk 10):', secretKey?.substring(0, 10));
  console.log('RND:', rnd);
  console.log('BODY:', bodyStr);

  try {
    const response = await fetch('https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/initialize/auth/ecom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'x-iyzi-rnd': rnd,
        'Accept': 'application/json'
      },
      body: bodyStr
    });

    const text = await response.text();
    console.log('IYZICO RAW:', text);

    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: 'Parse hatası', raw: text }); }

    if (data.status !== 'success') {
      return res.status(500).json({
        error: data.errorMessage || 'Ödeme başlatılamadı',
        errorCode: data.errorCode,
        raw: data
      });
    }

    return res.status(200).json({
      checkoutFormContent: data.checkoutFormContent,
      token: data.token
    });
  } catch (e) {
    console.log('FETCH HATA:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
