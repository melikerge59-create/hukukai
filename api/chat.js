// api/chat.js — HukukAI AI Sohbet API
// Vercel Serverless Function — ENV variables Vercel'den okunur
const { createClient } = require('@supabase/supabase-js');

const SYSTEM_PROMPTS = {
  is: `Sen Türkiye'nin en deneyimli iş hukuku uzmanısın. 4857 sayılı İş Kanunu, kıdem tazminatı, ihbar süreleri, işe iade davaları konularında detaylı bilgi verirsin. Her yanıtın sonuna [KANUN: İş Kanunu Madde X] formatında referans ekle. Yanıtlarını Türkçe ver, sade ve anlaşılır ol.`,
  kira: `Sen Türkiye'nin en deneyimli kira hukuku uzmanısın. TBK 299-378. maddeler, kira artışı, tahliye, depozito konularında bilgi verirsin. Her yanıtın sonuna [KANUN: TBK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  tuketici: `Sen Türkiye'nin en deneyimli tüketici hukuku uzmanısın. 6502 sayılı TKHK, ayıplı mal, garanti, iade hakları konularında bilgi verirsin. Her yanıtın sonuna [KANUN: TKHK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  aile: `Sen Türkiye'nin en deneyimli aile hukuku uzmanısın. TMK boşanma, nafaka, velayet, mal paylaşımı konularında bilgi verirsin. Her yanıtın sonuna [KANUN: TMK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  trafik: `Sen Türkiye'nin en deneyimli trafik hukuku uzmanısın. 2918 sayılı KTK, trafik kazası tazminatı, sigorta konularında bilgi verirsin. Her yanıtın sonuna [KANUN: KTK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  ceza: `Sen Türkiye'nin en deneyimli ceza hukuku uzmanısın. TCK, CMK kapsamında suç, şikayet, savunma hakları konularında bilgi verirsin. Her yanıtın sonuna [KANUN: TCK/CMK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  icra: `Sen Türkiye'nin en deneyimli icra hukuku uzmanısın. 2004 sayılı İİK, icra takibi, haciz, itiraz süreçleri konularında bilgi verirsin. Her yanıtın sonuna [KANUN: İİK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  miras: `Sen Türkiye'nin en deneyimli miras hukuku uzmanısın. TMK miras hükümleri, vasiyet, mirasçılık belgesi konularında bilgi verirsin. Her yanıtın sonuna [KANUN: TMK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  vergi: `Sen Türkiye'nin en deneyimli vergi hukuku uzmanısın. VUK, vergi cezaları, itiraz süreçleri konularında bilgi verirsin. Her yanıtın sonuna [KANUN: VUK Madde X] formatında referans ekle. Yanıtlarını Türkçe ver.`,
  default: `Sen HukukAI'nin yapay zeka destekli hukuk asistanısın. Türk hukuku konusunda uzmanlaşmışsın.
- Yanıtların net, anlaşılır ve pratik olsun
- Her yanıtın sonuna [KANUN: İlgili Kanun Adı Madde X] formatında referans ekle
- Önemli noktaları **kalın** yaz
- Resmi hukuki tavsiye olmadığını, önemli konularda avukata danışılmasını belirt
- Maksimum 400 kelime kullan`
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' });

    const { data: { user }, error: authError } = await sb.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Geçersiz oturum' });

    const { data: plan } = await sb
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const dailyLimit = plan?.daily_limit || 5;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: usedToday } = await sb
      .from('usage_counts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString());

    if (usedToday >= dailyLimit) {
      return res.status(429).json({ error: `Günlük ${dailyLimit} soru limitine ulaştınız`, limitExceeded: true });
    }

    const { message, conversationId, fileContent } = req.body;
    let { category = 'default' } = req.body;

    if (!message || message.trim().length === 0) return res.status(400).json({ error: 'Mesaj boş olamaz' });
    if (message.length > 1000) return res.status(400).json({ error: 'Mesaj çok uzun (max 1000 karakter)' });

    // Validate category — only allow known slugs
    const validCategories = ['is', 'kira', 'tuketici', 'aile', 'trafik', 'ceza', 'icra', 'miras', 'vergi', 'default'];
    if (!validCategories.includes(category)) category = 'default';

    // Validate fileContent: reject oversized or non-string values
    if (fileContent !== undefined && typeof fileContent !== 'string') {
      return res.status(400).json({ error: 'Geçersiz dosya içeriği' });
    }
    if (fileContent && fileContent.length > 50000) {
      return res.status(400).json({ error: 'Dosya içeriği çok büyük (max 50.000 karakter)' });
    }

    let conversationHistory = [];
    if (conversationId) {
      const { data: prevMessages } = await sb
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (prevMessages) {
        conversationHistory = prevMessages.map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content
        }));
      }
    }

    let userMessage = message;
    if (fileContent) {
      userMessage = `Aşağıdaki belgeyi analiz et:\n\n${fileContent.substring(0, 3000)}\n\nSorum: ${message}`;
    }

    const systemPrompt = SYSTEM_PROMPTS[category] || SYSTEM_PROMPTS.default;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (openaiResponse.status === 429) {
      return res.json({ reply: 'AI şu an yoğun. Lütfen 1 dakika sonra tekrar deneyin.', conversationId });
    }
    if (!openaiResponse.ok) {
      console.error('OpenAI error:', await openaiResponse.text());
      return res.status(500).json({ error: 'AI servisi geçici olarak kullanılamıyor' });
    }

    const aiData = await openaiResponse.json();
    const reply = aiData.choices[0].message.content;

    let convId = conversationId;
    if (!convId) {
      const { data: newConv } = await sb
        .from('conversations')
        .insert({ user_id: user.id, category, title: message.substring(0, 60) })
        .select()
        .single();
      convId = newConv?.id;
    }

    if (convId) {
      await sb.from('messages').insert([
        { conversation_id: convId, role: 'user', content: message },
        { conversation_id: convId, role: 'ai', content: reply }
      ]);
    }

    await sb.from('usage_counts').insert({ user_id: user.id });

    return res.json({ reply, conversationId: convId });

  } catch (err) {
    console.error('chat.js error:', err);
    return res.status(500).json({ error: 'Sunucu hatası, lütfen tekrar deneyin' });
  }
};
