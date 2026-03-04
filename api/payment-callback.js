const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const CALLBACK_PATH = '/payment/iyzipos/checkoutform/auth/ecom/detail';

function generateAuth(apiKey, secretKey, rnd, body) {
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rnd + CALLBACK_PATH + JSON.stringify(body))
    .digest('hex');
  const authParams = 'apiKey:' + apiKey + '&randomKey:' + rnd + '&signature:' + signature;
  return 'IYZWSv2 ' + Buffer.from(authParams).toString('base64');
}

module.exports = async function handler(req, res) {
  const siteUrl = 'https://hukukai-mu.vercel.app';

  // iyzipay POST ile token gönderir
  if (req.method !== 'POST') {
    return res.redirect(siteUrl + '?payment=error');
  }

  const { token, status } = req.body || {};

  if (!token) {
    return res.redirect(siteUrl + '?payment=error');
  }

  // Ödeme başarısız
  if (status === 'failure') {
    return res.redirect(siteUrl + '?payment=failed');
  }

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const rnd = String(process.hrtime()[0]) + Math.random().toString(36).slice(2);

  const reqBody = { locale: 'tr', token };
  const auth = generateAuth(apiKey, secretKey, rnd, reqBody);

  try {
    // iyzipay'den ödeme detayını al
    const resp = await fetch('https://sandbox-api.iyzipay.com' + CALLBACK_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'x-iyzi-rnd': rnd,
        'x-iyzi-client-version': 'iyzipay-node-2.0.65'
      },
      body: JSON.stringify(reqBody)
    });

    const text = await resp.text();
    console.log('CALLBACK RESULT:', text);

    let data;
    try { data = JSON.parse(text); } catch(e) {
      return res.redirect(siteUrl + '?payment=error');
    }

    // Ödeme başarılı mı?
    if (data.paymentStatus !== 'SUCCESS' && data.status !== 'success') {
      return res.redirect(siteUrl + '?payment=failed');
    }

    // conversationId = userId olarak kaydettik
    const userId = data.conversationId;
    
    // Hangi plan? basketItems'dan al
    const planId = data.basketId?.replace('bsk', '') ? 
      (data.itemTransactions?.[0]?.itemId || 'plus') : 'plus';

    const planLimits = { plus: 50, pro: 999999, elite: 999999 };
    const planLimit = planLimits[planId] || 50;

    // Supabase'de planı güncelle
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    );

    await supabase
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_type: planId,
        daily_limit: planLimit,
        is_active: true
      }, { onConflict: 'user_id' });

    console.log('Plan güncellendi:', userId, planId);

    // Başarı sayfasına yönlendir
    return res.redirect(siteUrl + '?payment=success&plan=' + planId);

  } catch(e) {
    console.log('CALLBACK HATA:', e.message);
    return res.redirect(siteUrl + '?payment=error');
  }
};
