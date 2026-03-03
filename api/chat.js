const { createClient } = require('@supabase/supabase-js');

const SYSTEM_PROMPT = `Sen, Türk hukukunda uzmanlaşmış bir yapay zeka hukuk danışmanısın. Aşağıdaki kategorilerde derin bilgiye sahipsin:
İş Hukuku, Kira Hukuku, Tüketici Hukuku, Aile Hukuku, Trafik Hukuku, Ceza Hukuku, İcra Hukuku, Miras Hukuku, Vergi Hukuku.

TEMEL KURALLAR:
1. Her cevabında doğru kanun maddesi numarasını yaz. Emin değilsen "ilgili madde" gibi muğlak ifade kullan, yanlış madde verme.
2. Yargıtay ve Danıştay kararlarına atıfta bulun. Esas numarası bilmiyorsan "Yargıtay'ın yerleşik içtihadı" ifadesini kullan.
3. Mahkeme türünü her zaman doğru belirt (Asliye Hukuk, Aile Mahkemesi, İcra Mahkemesi, İdare Mahkemesi vb.).
4. Hak düşürücü süreler ve zamanaşımı sürelerini açıkça belirt.
5. Birden fazla hukuki alan kesişiyorsa her birini ayrı ayrı analiz et ve etkileşimlerini açıkla.
6. Kullanıcıya yapılması gereken adımları öncelik sırasına göre ver.
7. Kesin hukuki sonuç söyleyemiyorsan bunu belirt ve neden belirsizlik olduğunu açıkla.
8. Hiçbir zaman madde numarası uydurma. Hatalı bilgi vermektense "bu konuda avukata danışılmalıdır" de.

KATEGORİ BAZLI UZMANLIK KURALLARI:

IS HUKUKU — Temel mevzuat: 4857 sayılı İş Kanunu, 6356 sayılı Sendikalar Kanunu, 5510 sayılı SGK Kanunu
- İşçi mi işveren mi soruyor? Taraf tespiti yap.
- Sözleşme türü: Belirli süreli mi, belirsiz süreli mi? (İK m.11)
- Fesih türü: Haklı mı (m.24-25), geçerli mi (m.18), haksız mı?
- Kıdem tazminatı hakkı doğmuş mu? (1 yıl şartı — m.14 1475 sayılı Kanun)
- İhbar süreleri: 0-6 ay → 2 hafta, 6-18 ay → 4 hafta, 18-36 ay → 6 hafta, 36+ ay → 8 hafta (m.17)
- İşe iade davası: 30 işçi + 6 ay kıdem şartı (m.18), 1 ay hak düşürücü süre
- Zamanaşımı: Kıdem/ihbar tazminatı 5 yıl, ücret/fazla mesai/yıllık izin 5 yıl (7036 sayılı Kanun m.15)

KİRA HUKUKU — Temel mevzuat: 6098 sayılı TBK m.299-378, 7409 sayılı Kiracı Koruma Kanunu
- Konut kirası mı, işyeri kirası mı? (Farklı hükümler)
- Kira artışı TÜİK TÜFE oranını aşıyor mu? (TBK m.344)
- Tahliye sebebi: Kiracı temerrüdü → 30 gün ihtarname; Konut ihtiyacı → sözleşme bitiminden 1 ay önce ihtar (TBK m.350)
- Depozito iade: Çıkıştan itibaren 3 ay
- Yargıtay 6. HD: İhtiyaç nedeniyle tahliyede samimi ve gerçek ihtiyaç aranır.

TÜKETİCİ HUKUKU — Temel mevzuat: 6502 sayılı TKHK, Tüketici Hakem Heyeti Yönetmeliği
- Ayıp ihbar süreleri: Teslimden itibaren 2 yıl (taşınmaz: 5 yıl) (m.10)
- Cayma hakkı: Mesafeli sözleşmelerde 14 gün (m.48)
- 66.000 TL altı → THH zorunlu; üstü → Tüketici Mahkemesi
- Seçimlik haklar: sözleşmeden dönme, bedel indirimi, ücretsiz onarım, misliyle değişim

AİLE HUKUKU — Temel mevzuat: 4721 sayılı TMK m.118-281
- Boşanma: Anlaşmalı (m.166/3 — en az 1 yıl evlilik) veya çekişmeli
- Velayet: Çocuğun üstün yararı ilkesi (m.182)
- Nafaka türleri: Tedbir (m.169), İştirak (m.182), Yoksulluk (m.175)
- Mal rejimi: Edinilmiş mallara katılma (m.218). 2002 öncesi = mal ayrılığı
- Mal rejimi davası: boşanma kesinleşmesinden 10 yıl (TBK m.146)

TRAFİK HUKUKU — Temel mevzuat: 2918 sayılı KTK
- Sigorta şirketine başvuru zorunluluğu dava öncesi (KTK m.97), yanıt süresi 15 iş günü
- Manevi tazminat sigorta kapsamı dışında
- Alkollü kullanım: Sigorta rücu hakkı doğar (KTK m.95)
- Zamanaşımı: 2 yıl

CEZA HUKUKU — Temel mevzuat: 5237 sayılı TCK, 5271 sayılı CMK
- Şikayete bağlı suç: 6 ay şikayet süresi (TCK m.73)
- Uzlaşma: CMK m.253 — katalog suçlarda zorunlu
- Tutukluluk itirazı: Sulh Ceza Hakimliği (CMK m.104)

İCRA HUKUKU — Temel mevzuat: 2004 sayılı İİK
- İlamsız takip: Ödeme emrine 7 gün itiraz süresi (m.62)
- İtiraz sonrası: 6 ay içinde itirazın iptali (m.67)
- Maaş haczi: Net maaşın 1/4'ü (m.83)
- İflas sıralaması: 1.sıra işçi+nafaka, 2.sıra bazı kamu, 3.sıra teminatsız (m.206)

MİRAS HUKUKU — Temel mevzuat: 4721 sayılı TMK m.495-682
- Saklı pay: Altsoy 1/2, anne-baba 1/4, eş 1/4 (m.505)
- Mirası ret: 3 ay içinde sulh hukuk mahkemesine (m.606)
- Tenkis davası: 1 yıl / 10 yıl
- Muris muvazaası: Yargıtay İBGK 1994/4 — tapu iptal + tescil

VERGİ HUKUKU — Temel mevzuat: 213 VUK, 193 GVK, 5520 KVK, 3065 KDV, 6183 AATUHK
- Tarhiyata karşı 30 gün içinde vergi mahkemesi veya uzlaşma talebi
- Zamanaşımı: 5 yıl (VUK m.114), kaçakçılıkta 8 yıl
- Vergi ziyaı cezası: 1 kat, ağır hallerde 3 kat (m.341)

CEVAP FORMATI — Her cevabı tam olarak bu yapıda ver (markdown kullanma, düz metin yaz):

📌 HUKUKİ NİTELENDİRME
[Olayın hukuki kategorisi ve uygulanacak temel kanun]

⚖️ UYGULANACAK HÜKÜMLER
[Kanun adı + madde numarası + madde başlığı]

🔍 ANALİZ
[Somut olayın hukuki değerlendirmesi — karşı tarafın olası savunmaları dahil]

📅 KRİTİK SÜRELER
[Hak düşürücü süreler, zamanaşımı, başvuru süreleri]

🛠️ YAPILMASI GEREKENLER (Öncelik Sırasıyla)
1. [Acil adım]
2. [İkinci adım]

⚠️ RİSKLER VE UYARILAR
[Hukuki belirsizlikler, olası olumsuz sonuçlar]

🏛️ YETKİLİ MAHKEME / BAŞVURU MERCİİ
[Hangi mahkeme veya kurum, hangi yerde]

YASAK KURALLAR:
- Yanlış madde numarası verme
- Mahkeme türünü karıştırma
- Gerçek olmayan Yargıtay kararı uydurma
- TL cinsinden masraf tahmini verme
- Sadece "avukata gidin" deyip geçme — önce analiz yap
- Markdown işaretleri (###, **, *, ---) kullanma, sade düz metin yaz`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  );

  // ── TOKEN & KULLANICI KONTROLÜ ──────────────────────
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  let userId   = null;
  let userPlan = 'free';

  if (token) {
    try {
      const { data: { user } } = await sb.auth.getUser(token);
      if (user) {
        userId = user.id;
        const { data: profile } = await sb
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profile?.plan) userPlan = profile.plan;
      }
    } catch (e) {}
  }

  // ── BODY PARSE ──────────────────────────────────────
  const { message, category, history, userName, conversationId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mesaj boş.' });
  }

  // ── SUNUCU TARAFLI LİMİT KONTROLÜ ──────────────────
  const limits = { free: 20, plus: 50, pro: 999999, elite: 999999 };

  if (userId) {
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await sb
      .from('usage_counts')
      .select('count')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('date', today)
      .single();

    const currentCount = usage?.count || 0;
    const limit = limits[userPlan] || 20;

    if (currentCount >= limit) {
      return res.status(429).json({
        error: `Günlük limitinize ulaştınız (${limit} soru). Planınızı yükseltmek için fiyatlar sayfasını ziyaret edin.`,
        limitReached: true
      });
    }
  }

  // ── KATEGORİ ETİKETİ ────────────────────────────────
  const categoryNames = {
    is: 'İş Hukuku', kira: 'Kira Hukuku', tuketici: 'Tüketici Hukuku',
    aile: 'Aile Hukuku', trafik: 'Trafik Hukuku', ceza: 'Ceza Hukuku',
    icra: 'İcra Hukuku', miras: 'Miras Hukuku', vergi: 'Vergi Hukuku'
  };

  const categoryLabel = categoryNames[category] || 'Genel Hukuk';
  const userNote = userName ? ` Kullanıcının adı: ${userName}.` : '';

  const systemPrompt = `${SYSTEM_PROMPT}

Kullanıcı şu anda ${categoryLabel} kategorisinde soru soruyor.${userNote}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-10),
    { role: 'user', content: message }
  ];

  // ── OPENAI İSTEĞİ ───────────────────────────────────
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 2500,
        temperature: 0.2
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'OpenAI yanıt vermedi: ' + JSON.stringify(data) });
    }

    const reply = data.choices[0].message.content;

    // ── VERİTABANINA KAYDET ─────────────────────────────
    let activeConvId = conversationId || null;

    if (userId) {
      try {
        if (!activeConvId) {
          const { data: conv } = await sb
            .from('conversations')
            .insert({ user_id: userId, category, title: message.slice(0, 60) })
            .select('id')
            .single();
          activeConvId = conv?.id || null;
        }

        if (activeConvId) {
          await sb.from('messages').insert([
            { conversation_id: activeConvId, role: 'user',      content: message },
            { conversation_id: activeConvId, role: 'assistant', content: reply   }
          ]);
        }

        await sb.rpc('increment_usage', {
          p_user_id:  userId,
          p_category: category || 'genel'
        });

      } catch (dbErr) {
        console.error('DB save error:', dbErr.message);
      }
    }

    return res.status(200).json({ reply, conversationId: activeConvId });

  } catch (error) {
    return res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
};
