// frontend/server/proxy.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const hfToken = process.env.VITE_HF_TOKEN;  // Render gibt das weiter
  if (!hfToken) {
    return res.status(500).json({ error: 'HF Token fehlt' });
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/google/gemma-2b-it', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: req.body,
    });

    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}