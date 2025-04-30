const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const fs = require("fs");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Lire les clés depuis keys.json
let validKeys = {};
try {
  validKeys = JSON.parse(fs.readFileSync("keys.json", "utf-8"));
} catch (error) {
  console.error("Erreur lecture des clés :", error);
}

// 🚀 Route principale protégée par clé
app.post("/", async (req, res) => {
  const { messages, key } = req.body;

  // 🔒 Vérifier que la clé existe et est activée
  if (!key || !validKeys[key]) {
    return res.status(403).json({ error: "Clé d'accès invalide ou désactivée." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages
      }),
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "Réponse invalide d'OpenAI" });
    }

    res.json({ answer: data.choices[0].message.content.trim() });

  } catch (error) {
    console.error("Erreur OpenAI:", error);
    res.status(500).json({ error: "Erreur serveur interne" });
  }
});

// ▶️ Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
