const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Proxy Server pour Analyse Linguistique est en ligne',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Le message est requis' 
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'Configuration du serveur incorrecte' 
      });
    }

    console.log('📨 Requête reçue:', message.substring(0, 50) + '...');

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Tu es un expert en linguistique française. Réponds à cette question de manière claire et pédagogique: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('❌ Erreur Gemini API:', errorData);
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Réponse invalide de Gemini API');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    console.log('✅ Réponse envoyée');

    res.json({ 
      success: true, 
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    res.status(500).json({
