const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Configuration
const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
const OPENAI_KEY = (process.env.OPEN_AI_API_KEY || '').trim();

// Initialize SDKs
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

console.log(`[INIT] Gemini Key Loaded: ${GEMINI_KEY ? 'YES (' + GEMINI_KEY.substring(0, 4) + '...)' : 'NO'}`);

/**
 * Fetches the actual text of the tweet via oEmbed to avoid AI hallucinations.
 */
async function getTweetSourceData(tweetUrl) {
  try {
    console.log(`[FETCH] Obteniendo contenido de: ${tweetUrl}`);
    const fetchUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();
    
    if (data && data.html) {
      // Basic HTML stripping and entity decoding
      let text = data.html.replace(/<[^>]*>/g, ' '); // Remove tags
      text = text.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      text = text.replace(/\n\s*\n/g, '\n').trim(); // Cleanup whitespace
      
      console.log(`[FETCH] Contenido recuperado: "${text.substring(0, 50)}..."`);
      return text;
    }
  } catch (err) {
    console.warn(`[FETCH] No se pudo obtener contenido del post: ${err.message}`);
  }
  return "Contenido no disponible directamente. Analiza basándote en el contexto de la URL.";
}

/**
 * Helper to fetch image directly from a URL and format for Gemini Multimodal
 */
async function fetchImageAsBase64(imageUrl) {
  try {
    console.log(`[FETCH] Descargando imagen: ${imageUrl}`);
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    return {
      inlineData: {
        data: base64,
        mimeType: mimeType
      }
    };
  } catch (err) {
    console.warn(`[IMAGE ERROR] No se pudo procesar la imagen: ${err.message}`);
    return null;
  }
}

/**
 * Fact Check Core Logic
 */
async function performFactCheck(tweetUrl, imageUrl = null) {
  const tweetContent = await getTweetSourceData(tweetUrl);
  let imagePart = null;
  
  let prompt = `Actúa como un experto en fact-checking académico. 
  Analiza la veracidad de la siguiente publicación de X (Twitter).

  CONTENIDO DEL POST: "${tweetContent}"
  URL: ${tweetUrl}`;

  if (imageUrl) {
    imagePart = await fetchImageAsBase64(imageUrl);
    if (imagePart) {
      prompt += `\n\nATENCIÓN: El usuario ha proporcionado una imagen como evidencia adjunta. Debes analizar la imagen en conjunto con el texto para detectar manipulaciones o validar afirmaciones visuales.`;
    }
  }

  prompt += `\n\nATENCIÓN OBLIGATORIA: Escribe TODAS tus respuestas DENTRO del JSON exclusivamente en ESPAÑOL, sin importar el idioma en el que esté escrito el post original.

  Responde estrictamente en un objeto JSON con este formato:
  {
    "veracity_score": <puntos de 0 a 100>,
    "correctness": "puntos veraces encontrados (en ESPAÑOL)",
    "falsehood": "inconsistencias o falsedades (en ESPAÑOL)",
    "reasoning": "conclusión del experto bien fundamentada (en ESPAÑOL)"
  }`;

  if (genAI) {
    const models = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
    for (const modelName of models) {
      try {
        console.log(`[EXE] Intentando Gemini multimodal con ${modelName}...`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        
        let contents = [prompt];
        if (imagePart) {
          contents.push(imagePart);
        }

        const result = await model.generateContent(contents);
        const text = await result.response.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        
        console.log(`✅ [GEMINI] Éxito con ${modelName}`);
        return {
          id: `gemini-${modelName}-${Date.now()}`,
          tweet_url: tweetUrl,
          tweet_content: `Análisis real via ${modelName}`,
          veracity_score: analysis.veracity_score,
          analysis: analysis,
          created_at: new Date().toISOString()
        };
      } catch (e) {
        console.warn(`[FAIL] ${modelName}: ${e.message}`);
      }
    }
  }

  if (openai) {
    try {
      console.log(`[EXE] Intentando OpenAI Fallback...`);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const analysis = JSON.parse(completion.choices[0].message.content);
      return {
        id: `openai-${Date.now()}`,
        tweet_url: tweetUrl,
        tweet_content: `Análisis real via GPT-4o Mini`,
        veracity_score: analysis.veracity_score,
        analysis: analysis,
        created_at: new Date().toISOString()
      };
    } catch (e) {
      console.warn(`[FAIL] OpenAI: ${e.message}`);
    }
  }

  return {
    id: `demo-${Date.now()}`,
    tweet_url: tweetUrl,
    tweet_content: `[DEMO] No se pudo conectar con las APIs de IA.`,
    veracity_score: 85,
    analysis: {
      veracity_score: 85,
      correctness: "La publicación parece legítima según patrones académicos.",
      falsehood: "Sin embargo, no hay confirmación de fuentes primarias por fallo de API.",
      reasoning: "Debido a errores técnicos, se proporciona este informe basado en la estructura local."
    },
    created_at: new Date().toISOString()
  };
}

// Diagnostics
app.get('/api/test-gemini', async (req, res) => {
  console.log("[DIAG] /api/test-gemini hit");
  if (!genAI) return res.status(500).json({ status: "fail", error: "No Gemini Key" });
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent("Di 'Gemini OK'");
    res.json({ status: "success", message: await result.response.text() });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: "UP" }));

app.post('/api/analyze', async (req, res) => {
  const { tweetUrl, imageUrl } = req.body;
  if (!tweetUrl) return res.status(400).json({ error: "No URL" });
  const data = await performFactCheck(tweetUrl, imageUrl);
  res.json({ success: true, data });
});

const PORT = 3010;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fact-Checker Server active on port ${PORT}`);
});
