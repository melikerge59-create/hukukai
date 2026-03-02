module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mesaj boş.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen HukukAI adli bir Turk hukuk bilgi asistanisin. Turk hukukuna gore bilgi veriyorsun. Her zaman Turkce cevap ver. Her cevabın sonuna su uyariyi ekle: Bu bilgi genel amaclidir, avukatlik hizmeti degildir.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'API yanit vermedi: ' + JSON.stringify(data) });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Hata: ' + error.message });
  }
}
