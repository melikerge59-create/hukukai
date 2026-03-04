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
    conversationId: userId,
    price: price,
    paidPrice: price,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `${userId}-${plan}-${Date.now()}`,
    paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
    callbackUrl: `${process.env.SITE_URL}/api/payment-callback`,
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: userId,
      name: userName?.split(' ')[0] || 'Ad',
      surname: userName?.split(' ')[1] || 'Soyad',
      email: userEmail,
      identityNumber: '11111111111',
      registrationAddress: 'Türkiye',
      city: 'Istanbul',
      country: 'Turkey'
    },
    shippingAddress: {
      contactName: userName || 'Ad Soyad',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Türkiye'
    },
    billingAddress: {
      contactName: userName || 'Ad Soyad',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Türkiye'
    },
    basketItems: [
      {
        id: plan,
        name: `HukukAI ${plan} Plan`,
        category1: 'Yazılım',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: price
      }
    ]
  };

  return new Promise((resolve) => {
    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err || result.status !== 'success') {
        res.status(500).json({ error: err?.message || result?.errorMessage || 'Ödeme başlatılamadı' });
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
