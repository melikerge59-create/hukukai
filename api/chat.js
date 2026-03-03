module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── GÜVENLİK: Token kontrolü ──────────────────────
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  let userId = null;
  let userPlan = 'free';

  if (token) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const sb = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      const { data: { user } } = await sb.auth.getUser(token);
      if (user) {
        userId = user.id;
        // Kullanıcının planını çek
        const { data: profile } = await sb
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile) userPlan = profile.plan;
      }
    } catch (e) {
      // Token geçersizse misafir olarak devam et
    }
  }

  // ── LİMİT KONTROLÜ (sunucu tarafında) ─────────────
  const { message, category, history, userName } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mesaj boş.' });
  }

  // Misafir limiti: günde max 3 istek (IP bazlı basit kontrol)
  // Giriş yapmış ücretsiz: 20/gün → plan kontrolü
  const limits = { free: 20, plus: 50, pro: 99999, elite: 99999 };
  const guestLimit = 3;

  if (!userId) {
    // Misafir kullanıcı — sadece istek geldi mi diye bakıyoruz
    // (Daha gelişmiş IP kontrolü ödeme aşamasında eklenecek)
  }

  // ── KATEGORİ PROMPT'LARI ───────────────────────────
  const categoryPrompts = {
    is:       'Sen bir İş Hukuku uzmanısın. 4857 sayılı İş Kanunu, kıdem tazminatı, ihbar tazminatı, işten çıkarma, fazla mesai, yıllık izin konularında derinlemesine bilgi sahibisin.',
    kira:     'Sen bir Kira Hukuku uzmanısın. Türk Borçlar Kanunu kira hükümleri, kiracı ve ev sahibi hakları, kira artışı, tahliye, depozito konularında uzmansın.',
    tuketici: 'Sen bir Tüketici Hakları uzmanısın. 6502 sayılı Kanun, ayıplı mal, garanti, iade, tüketici mahkemesi konularında uzmansın.',
    aile:     'Sen bir Aile Hukuku uzmanısın. Türk Medeni Kanunu, boşanma, nafaka, velayet, mal rejimi konularında uzmansın.',
    trafik:   'Sen bir Trafik Hukuku uzmanısın. Karayolları Trafik Kanunu, kaza tazminatı, sigorta, trafik cezaları konularında uzmansın.',
    ceza:     'Sen bir Ceza Hukuku uzmanısın. Türk Ceza Kanunu, suç tanımları, savunma hakları, şikayet süreçleri konularında uzmansın.',
    icra:     'Sen bir İcra Hukuku uzmanısın. 2004 sayılı İcra ve İflas Kanunu, icra takibi, borca itiraz, haciz işlemleri konularında uzmansın.',
    miras:    'Sen bir Miras Hukuku uzmanısın. Türk Medeni Kanunu miras hükümleri, vasiyetname, miras reddi, tenkis davası konularında uzmansın.',
    vergi:    'Sen bir Vergi Hukuku uzmanısın. Türk vergi mevzuatı, vergi cezaları, uzlaşma, vergi mahkemesi konularında uzmansın.'
  };

  const basePrompt = categoryPrompts[category] ||
    'Sen HukukAI adlı bir Türk hukuk bilgi asistanısın.';

  const systemPrompt = basePrompt + `
Her yanıtta şu 8 bölümü kullan:
📌 Durum Analizi — Sorunun kısa özeti
⚖️ Hukuki Dayanak — İlgili kanun maddesi
⚠️ Risk Seviyesi — Düşük / Orta / Yüksek
⏳ Süreler — Dikkat edilmesi gereken yasal süreler
💰 Tahmini Masraf — Yaklaşık maliyet
🛠 Yapman Gerekenler — Adım adım yapılacaklar
🔄 Alternatif Senaryo — Farklı olasılıklar
❗ Sık Yapılan Hatalar — Kaçınılması gerekenler
Her zaman Türkçe, sade ve anlaşılır cevap ver.${userName ? ' Kullanıcının adı: ' + userName + '.' : ''}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-10),
    { role: 'user', content: message }
  ];

  // ── OPENAI İSTEĞİ ──────────────────────────────────
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'API yanıt vermedi: ' + JSON.stringify(data) });
    }

    const reply = data.choices[0].message.content;

    // ── KONUŞMAYI KAYDET (giriş yapmış kullanıcılar için) ──
    if (userId) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const sbAdmin = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
        );

        // Bugünkü konuşmayı bul veya yeni oluştur
        let convId = req.body.conversationId;
        if (!convId) {
          const { data: conv } = await sbAdmin
            .from('conversations')
            .insert({ user_id: userId, category, title: message.slice(0, 60) })
            .select('id')
            .single();
          convId = conv?.id;
        }

        if (convId) {
          await sbAdmin.from('messages').insert([
            { conversation_id: convId, role: 'user',      content: message },
            { conversation_id: convId, role: 'assistant', content: reply   }
          ]);
        }

        // Kullanım sayacını güncelle
        await sbAdmin.rpc('increment_usage', {
          p_user_id:  userId,
          p_category: category || 'genel'
        });

      } catch (dbErr) {
        // DB hatası AI yanıtını engellemez
        console.error('DB save error:', dbErr.message);
      }
    }

    return res.status(200).json({ reply, conversationId: req.body.conversationId });

  } catch (error) {
    return res.status(500).json({ error: 'Hata: ' + error.message });
  }
};
