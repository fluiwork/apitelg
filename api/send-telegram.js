const axios = require('axios');

module.exports = async (req, res) => {
  // 1. Definir el dominio permitido (cambia esto por tu dominio real)
  const allowedOrigin = 'https://mygiftinfo.com'; 
  
  // 2. Obtener el origen de la solicitud
  const requestOrigin = req.headers.origin;
  
  // 3. Verificar si el origen está permitido
  if (requestOrigin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    // Si el origen no está permitido, puedes optar por:
    // a) No establecer el header (el navegador bloqueará la respuesta)
    // b) Devolver un error
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight por 24 horas

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validar que sea POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Validar que las variables de entorno estén configuradas
  if (!botToken || !chatId) {
    console.error('Missing Telegram configuration');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Telegram API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error sending message to Telegram' });
  }
};
