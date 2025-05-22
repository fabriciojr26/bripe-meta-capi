// index.js - MAX Adaptado para postback Bripe
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());

function hash(value) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

app.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    // 1. Campos obrigatórios
    const email = data.email || "";
    const phone = data.phone || "";
    const fn = data.first_name || "";
    const ln = data.last_name || "";
    const ct = data.city || "";
    const st = data.state || "";
    const zp = data.zip || "";
    const external_id = data.external_id || data.transaction_id || "cliente_bripe";
    const value = data.value || 0;
    const currency = data.currency || "BRL";

    // 2. Campos de rastreio (simulados)
    const fbc = "fb.1." + Date.now() + ".BripeFBC";
    const fbp = "fb.1." + Date.now() + ".BripeFBP";

    // 3. Estrutura de evento para Meta
    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: "https://pay.braip.co",
          user_data: {
            em: [hash(email)],
            ph: [hash(phone)],
            fn: [hash(fn)],
            ln: [hash(ln)],
            ct: [hash(ct)],
            st: [hash(st)],
            zp: [hash(zp)],
            external_id: [hash(external_id)],
            fbc: fbc,
            fbp: fbp,
          },
          custom_data: {
            currency: currency,
            value: value,
          },
        },
      ],
    };

    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_TOKEN;

    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const fbResponse = await axios.post(url, payload);

    return res.status(200).json({ success: true, meta: fbResponse.data });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook CAPI ativo na porta ${PORT}`);
});

