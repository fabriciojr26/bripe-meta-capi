const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
app.use(express.json());

function hashSHA256(value) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

app.post("/webhook", async (req, res) => {
  const { transaction, ip, user_agent, fbc, fbp } = req.body;
  const email = transaction?.email || "";
  const phone = transaction?.telefone || "";
  const nome = transaction?.nome?.split(" ") || [];
  const firstName = nome[0] || "";
  const lastName = nome.slice(1).join(" ") || "";
  const value = parseFloat(transaction?.valor || "0");

  const accessToken = process.env.ACCESS_TOKEN_META;
  const pixelId = process.env.PIXEL_ID;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: "https://seusite.com/checkout", // pode ser fictício
        user_data: {
          em: [hashSHA256(email)],
          ph: [hashSHA256(phone)],
          fn: [hashSHA256(firstName)],
          ln: [hashSHA256(lastName)],
          client_ip_address: ip,
          client_user_agent: user_agent,
          fbc: fbc || null,
          fbp: fbp || null
        },
        custom_data: {
          value: value,
          currency: "BRL",
          content_name: transaction?.produto || "Produto IPTV"
        }
      }
    ]
  };

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;
    const response = await axios.post(url, payload, {
      params: { access_token: accessToken }
    });
    console.log("🎯 Evento enviado com sucesso:", response.data);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Erro ao enviar evento:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("🔥 Webhook CAPI ativo em http://localhost:3000/webhook");
});
