require('dotenv').config(); // <-- Très important : charger les variables d'environnement
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // 🔥 Utilisation sécurisée de la clé
});

// Route pour recevoir les questions
app.post('/api/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Pas de question reçue.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }]
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erreur serveur lors de la réponse.' });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
