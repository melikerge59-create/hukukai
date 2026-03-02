module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mesaj bos.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.OPENAI_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: 'Sen HukukAI adli bir Turk hukuk bilgi asistanisin. Turk hukukuna gore bilgi veriyorsun. Her zaman Turkce cevap ver. Her cevabın sonuna su uyariyi ekle: Bu bilgi genel amaclidir, avukatlik hizmeti degildir. Soru: ' + message
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Claude response:', JSON.stringify(data));

    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: 'API yanit vermedi: ' + JSON.stringify(data) });
    }

    const reply = data.content[0].text;
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Hata: ' + error.message });
  }
}

