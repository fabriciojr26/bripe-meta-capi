const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// Função de hash padronizada
function hashSHA256(value) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

app.post('/webhook', async (req, res) => {
  try {
    const {
      email,
      phone,
      ip,
      userAgent,
      fbc,
      fbp,
      fn,
      ln,
      ge,
      db,
      ct,
      st,
      zp,
      external_id,
      value,
      currency,
      url
    } = req.body;

    const accessToken = process.env.META_TOKEN;
    const pixelId = process.env.META_PIXEL_ID;
    const apiUrl = `https://graph.facebook.com/v19.0/${pixelId}/events`;

    const event = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: url || "https://bripe.com",
      user_data: {
        em: [hashSHA256(email)],
        ph: [hashSHA256(phone)],
        fn: fn ? [hashSHA256(fn)] : undefined,
        ln: ln ? [hashSHA256(ln)] : undefined,
        ge: ge ? [hashSHA256(ge)] : undefined,
        db: db ? [hashSHA256(db)] : undefined,
        ct: ct ? [hashSHA256(ct)] : undefined,
        st: st ? [hashSHA256(st)] : undefined,
        zp: zp ? [hashSHA256(zp)] : undefined,
        external_id: external_id ? [hashSHA256(external_id)] : undefined,
        client_ip_address: ip,
        client_user_agent: userAgent,
        fbc,
        fbp
      },
      custom_data: {
        value: parseFloat(value || 0),
        currency: currency || "BRL"
      }
    };

    
    const payload = { data: [event] };

    const response = await axios.post(apiUrl, payload, {
      params: { access_token: accessToken }
    });

    res.json({ success: true, meta: response.data });
  } catch (error) {
    console.error('Erro ao enviar evento:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook CAPI ativo na porta ${PORT}`);
});
