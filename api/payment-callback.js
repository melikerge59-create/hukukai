const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const DETAIL_PATH = '/payment/iyzipos/checkoutform/auth/ecom/detail';
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
const PLAN_LIMITS = { plus: 50, pro: 999999, elite: 999999 };
const PLAN_AMOUNTS = { plus: 99, pro: 349, elite: 799 };

function generateAuth(apiKey, secretKey, rnd, body) {
  const sig = crypto.createHmac('sha256', secretKey)
    .update(rnd + DETAIL_PATH + JSON.stringify(body)).digest('hex');
  return 'IYZWSv2 ' + Buffer.from('apiKey:' + apiKey + '&randomKey:' + rnd + '&signature:' + sig).toString('base64');
}

module.exports = async function handler(req, res) {
  const SITE = process.env.SITE_URL || 'https://hukukai.vercel.app';
  if (req.method !== 'POST') return res.redirect(303, SITE);

  const token  = req.body?.token;
  const status = req.body?.status;
  if (!token)               return res.redirect(303, SITE + '?payment=error');
  if (status === 'failure') return res.redirect(303, SITE + '?payment=failed');

  const apiKey    = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const rnd       = String(process.hrtime()[0]) + Math.random().toString(36).slice(2);
  const reqBody   = { locale: 'tr', token };

  try {
    const resp = await fetch(IYZICO_BASE_URL + DETAIL_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateAuth(apiKey, secretKey, rnd, reqBody),
        'x-iyzi-rnd': rnd,
        'x-iyzi-client-version': 'iyzipay-node-2.0.65'
      },
      body: JSON.stringify(reqBody)
    });

    const data = JSON.parse(await resp.text());

    if (data.paymentStatus !== 'SUCCESS' && data.status !== 'success') {
      return res.redirect(303, SITE + '?payment=failed');
    }

    const userId = data.conversationId;
    const planId = data.basketItems?.[0]?.id || data.itemTransactions?.[0]?.itemId || 'plus';

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    if (userId) {
      const { error: planErr } = await supabase
        .from('user_plans')
        .update({ plan_type: planId, daily_limit: PLAN_LIMITS[planId] || 50, is_active: true })
        .eq('user_id', userId);

      if (planErr) {
        await supabase.from('user_plans').insert({
          user_id: userId, plan_type: planId,
          daily_limit: PLAN_LIMITS[planId] || 50, is_active: true
        });
      }

      await supabase.from('payment_history').insert({
        user_id:         userId,
        plan_type:       planId,
        amount:          PLAN_AMOUNTS[planId] || 99,
        currency:        'TRY',
        status:          'success',
        iyzipay_token:   token,
        conversation_id: data.conversationId
      });
    }

    return res.redirect(303, SITE + '?payment=success&plan=' + planId);
  } catch (e) {
    console.error('payment-callback.js error:', e.message);
    return res.redirect(303, SITE + '?payment=error');
  }
};
