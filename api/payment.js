const crypto = require('crypto');

function generateAuthorizationHeader(apiKey, secretKey, randomString, requestBody) {
  const hash = crypto.createHmac('sha256', secretKey).update(apiKey + randomString + requestBody).digest('base64');
const authStr = `apiKey:${apiKey}&randomKey:${randomString}&signature:${hash}`;
return Buffer.from(authStr).toString('base64');

}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, userEmail, userName, userId } = req.body;

  const planPrices = { plus: '99.00', pro: '349.00', elite: '799.00' };
  const price = planPrices[plan];
  if (!price) return res.status(400).json({ error: 'Geçersiz plan' });

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const randomString = Math.random().toString(36).substring(2, 12);

  const requestBody = JSON.stringify({
    locale: 'tr',
    conversationId: userId?.substring(0, 36) || 'conv-1',
    price: price,
    paidPrice: price,
    currency: 'TRY',
    basketId: `basket-${Date.now()}`,
    paymentGroup: 'SUBSCRIPTION',
    callbackUrl: 'https://hukukai-mu.vercel.app/api/payment-callback',
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: userId?.substring(0, 36) || 'buyer-1',
      name: userName?.split(' ')[0] || 'Ad',
      surname: userName?.split(' ')[1] || 'Soyad',
      email: userEmail || 'test@test.com',
      identityNumber: '11111111111',
      registrationAddress: 'Istanbul',
      city: 'Istanbul',
      country: 'Turkey',
      ip: '85.34.78.112'
    },
    shippingAddress: {
      contactName: userName || 'Ad Soyad',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Istanbul'
    },
    billingAddress: {
      contactName: userName || 'Ad Soyad',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Istanbul'
    },
    basketItems: [{
      id: plan,
      name: `HukukAI ${plan} Plan`,
      category1: 'Yazilim',
      itemType: 'VIRTUAL',
      price: price
    }]
  });

  const authorization = generateAuthorizationHeader(apiKey, secretKey, randomString, requestBody);

  try {
    const response = await fetch('https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/initialize/auth/ecom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `IYZWSv2 ${authorization}`,
        'x-iyzi-rnd': randomString
      },
      body: requestBody
    });

    const data = await response.json();
    console.log('IYZICO RESPONSE:', JSON.stringify(data));

    if (data.status !== 'success') {
      return res.status(500).json({
        error: data.errorMessage || 'Ödeme başlatılamadı',
        errorCode: data.errorCode
      });
    }

    return res.status(200).json({
      checkoutFormContent: data.checkoutFormContent,
      token: data.token
    });

  } catch (e) {
    console.log('FETCH ERROR:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
