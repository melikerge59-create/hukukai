module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, category, history, userName } = req.body;

  const categoryPrompts = {
    'is': 'Sen bir İş Hukuku uzmanısın. Türk İş Kanunu, kıdem tazminatı, ihbar tazminatı, işten çıkarma, fazla mesai, yıllık izin konularında uzman bilgi veriyorsun.',
    'kira': 'Sen bir Kira Hukuku uzmanısın. Türk Borçlar Kanunu kira hükümleri, kiracı hakları, ev sahibi hakları, kira artışı, tahliye, depozito konularında uzman bilgi veriyorsun.',
    'tuketici': 'Sen bir Tüketici Hakları uzmanısın. 6502 sayılı Tüketicinin Korunması Hakkında Kanun, ayıplı mal, garanti, iade, tüketici mahkemesi konularında uzman bilgi veriyorsun.',
    'aile': 'Sen bir Aile Hukuku uzmanısın. Türk Medeni Kanunu, boşanma, nafaka, velayet, mal rejimi, miras konularında uzman bilgi veriyorsun.',
    'trafik': 'Sen bir Trafik Hukuku uzmanısın. Karayolları Trafik Kanunu, trafik kazası tazminatı, sigorta, trafik cezaları konularında uzman bilgi veriyorsun.',
    'ceza': 'Sen bir Ceza Hukuku uzmanısın. Türk Ceza Kanunu, suç tanımları, savunma hakları, şikayet süreçleri konularında uzman bilgi veriyorsun.'
  };

  const systemPrompt = categoryPrompts[category] || 'Sen HukukAI adlı bir Türk hukuk bilgi asistanısın.';
  const fullPrompt = systemPrompt + ` Her zaman Türkçe cevap ver. Kısa ve anlaşılır cevaplar ver. ${userName ? 'Kullanıcının adı: ' + userName + '. Samimi ve yardımsever ol.' : ''}`;

  const messages = [
    { role: 'system', content: fullPrompt },
    ...(history || []),
    { role: 'user', content: message || 'Merhaba' }
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 600
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'API yanıt vermedi: ' + JSON.stringify(data) });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Hata: ' + error.message });
  }
};
