/**
 * ======================================
 * PROXY SECURISE POUR API GEMINI - SDL
 * ======================================
 */

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

// Test de démarrage
app.get("/", (req, res) => {
  res.send("✅ Proxy API pour Analyse Linguistique est actif !");
});

// Route principale
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message requis" });
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Aucune réponse générée.";

    res.json({ reply });
  } catch (error) {
    console.error("Erreur Proxy:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy lancé sur le port ${PORT}`));
