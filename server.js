const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// نقطة اختبار الاتصال
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Proxy Server pour Analyse Linguistique est en ligne',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// نقطة نهاية للدردشة مع Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Le message est requis' 
      });
    }

    // استدعاء Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY || 'AIzaSyCoEuxM-BYXFx_bgQKhnnw7MJX4f4XH4a0'}`,
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
      success: false, 
      error: 'Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.'
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    availableRoutes: ['GET /', 'POST /api/chat']
  });
});

// للتشغيل المحلي
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🎓 Proxy Server - Analyse Linguistique  ║
╠════════════════════════════════════════╣
║   Status: ✅ En ligne                   ║
║   Port: ${PORT}                        ║
╚════════════════════════════════════════╝
    `);
  });
}

// للنشر على Vercel
module.exports = app;
