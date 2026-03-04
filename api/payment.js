const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com'
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, userEmail, userName, userId } = req.body;

  const planPrices = {
    plus: '99.00',
    pro: '349.00',
    elite: '799.00'
  };

  const price = planPrices[plan];
  if (!price) {
    return res.status(400).json({ error: 'Geçersiz plan' });
  }

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: String(userId).substring(0, 36),
    price: price,
    paidPrice: price,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `basket-${Date.now()}`,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl: `https://hukukai-mu.vercel.app/api/payment-callback`,
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: String(userId).substring(0, 36),
      name: (userName?.split(' ')[0] || 'Ad').substring(0, 30),
      surname: (userName?.split(' ')[1] || 'Soyad').substring(0, 30),
      email: userEmail,
      identityNumber: '11111111111',
      registrationAddress: 'Istanbul',
      city: 'Istanbul',
      country: 'Turkey',
      ip: '85.34.78.112'
    },
    shippingAddress: {
      contactName: (userName || 'Ad Soyad').substring(0, 60),
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Istanbul'
    },
    billingAddress: {
      contactName: (userName || 'Ad Soyad').substring(0, 60),
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Istanbul'
    },
    basketItems: [
      {
        id: plan,
        name: `HukukAI ${plan} Plan`,
        category1: 'Yazilim',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: price
      }
    ]
  };

  return new Promise((resolve) => {
    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      console.log('IYZICO RESULT:', JSON.stringify(result));
      console.log('IYZICO ERROR:', err);
      
      if (err) {
        res.status(500).json({ error: err.message });
        resolve();
        return;
      }
      
      if (result.status !== 'success') {
        res.status(500).json({ 
          error: result.errorMessage || 'Ödeme başlatılamadı',
          errorCode: result.errorCode
        });
        resolve();
        return;
      }
      
      res.status(200).json({
        checkoutFormContent: result.checkoutFormContent,
        token: result.token
      });
      resolve();
    });
  });
};
