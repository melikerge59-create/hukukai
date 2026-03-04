const Iyzipay = require('iyzipay');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, userEmail, userName, userId } = req.body;

  const planPrices = { plus: '99.00', pro: '349.00', elite: '799.00' };
  const price = planPrices[plan];
  if (!price) return res.status(400).json({ error: 'Geçersiz plan' });

  const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: 'https://sandbox-api.iyzipay.com'
  });

  const request = {
    locale: 'tr',
    conversationId: (userId || 'user1').substring(0, 36),
    price: price,
    paidPrice: price,
    currency: 'TRY',
    basketId: `basket-${Date.now()}`,
    paymentGroup: 'SUBSCRIPTION',
    callbackUrl: 'https://hukukai-mu.vercel.app/api/payment-callback',
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: (userId || 'buyer1').substring(0, 36),
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
  };

  try {
    const result = await new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        console.log('RESULT:', JSON.stringify(result));
        console.log('ERROR:', JSON.stringify(err));
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.status !== 'success') {
      return res.status(500).json({
        error: result.errorMessage || 'Ödeme başlatılamadı',
        errorCode: result.errorCode,
        raw: result
      });
    }

    return res.status(200).json({
      checkoutFormContent: result.checkoutFormContent,
      token: result.token
    });

  } catch (e) {
    console.log('CATCH:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
