const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const { email, nome, telefone } = req.body.user_data;

  const payload = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    user_data: {
      em: [hash(email)],
      ph: [hash(telefone)],
      fn: [hash(nome.split(' ')[0])]
    },
    custom_data: {
      currency: 'BRL',
      value: 1.0
    }
  };

  try {
    const response = await axios.post(
      'https://graph.facebook.com/v19.0/1896005774559273/events?access_token=EAASmzlYFHgkBOwVQXh04S04ZBDJXvZA63XzUYlt5MbM0FQikbHTyR3rnHNMkrS5NCzu6ksJ86Vo7nC5NsqRiHyU4UnS60kn0oMZAD9GQdo1fDK1ADC9ROCLNh00cno54ZBbzVfBDSKfQLqPqMlZCAipjjtqszQ7ZAAwXQeVh3Ij2TtZBxu5gV0B8rpHeCDcLC22pwZDZD',
      {
        data: [payload]
      }
    );
    console.log('Evento enviado com sucesso!');
    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao enviar evento:', error.response?.data || error.message);
    res.sendStatus(500);
  }
});

function hash(str) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update((str || '').trim().toLowerCase()).digest('hex');
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
