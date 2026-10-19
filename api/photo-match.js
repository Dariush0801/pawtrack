/**
 * Vercel Serverless Function: AI Photo Match (Google AI Studio / Gemini)
 * Makes ONE vision call per uploaded photo to extract pet traits (species, breed,
 * colors, markings). The browser then ranks all missing pets locally with
 * pawStore.runAiPetMatch(), so cost stays constant no matter how many pets are missing.
 *
 * Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional, default gemini-flash-latest)
 */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitHits = new Map(); // best-effort per-instance limiter

const TRAIT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    isPet: { type: 'BOOLEAN' },
    species: { type: 'STRING', enum: ['Dog', 'Cat', 'Other', 'Unknown'] },
    breed: { type: 'STRING' },
    colors: { type: 'ARRAY', items: { type: 'STRING' } },
    coatPattern: { type: 'STRING' },
    size: { type: 'STRING', enum: ['Small', 'Medium', 'Large', 'Unknown'] },
    distinctMarkings: { type: 'STRING' },
    summary: { type: 'STRING' }
  },
  required: ['isPet', 'species', 'breed', 'colors', 'distinctMarkings', 'summary']
};

const PROMPT = `You are helping a lost-pet recovery service in Metro Manila match a photo against missing pet reports.
Describe the main animal in this photo.
- species: Dog, Cat, Other, or Unknown.
- breed: most likely breed or mix (e.g. "Aspin", "Puspin", "Golden Retriever Mix"). Use "Unknown" if unsure.
- colors: simple lowercase color words for the coat (e.g. "golden", "white", "black", "brown", "orange", "grey", "tan", "brindle", "calico", "tricolor", "cream").
- coatPattern: e.g. solid, spotted, patched, striped, tricolor.
- distinctMarkings: visible identifying features using plain words (collar, tag, patch, spots, ear, tail, socks, chest, scar, fluffy, short).
- summary: one short sentence.
If there is no animal in the photo, set isPet to false.`;

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (rateLimitHits.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  rateLimitHits.set(ip, hits);
  return hits.length > RATE_LIMIT_MAX;
}

/**
 * Sends a base64 image (data URL or raw base64) to Gemini and returns structured pet traits.
 * Shared by the Vercel handler below and the local server.js route.
 */
async function analyzePetPhoto(image) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured on the server');
    err.status = 500;
    throw err;
  }

  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(image || '');
  const mimeType = match ? match[1] : 'image/jpeg';
  const data = match ? match[2] : (image || '');
  if (!data) {
    const err = new Error('No image provided');
    err.status = 400;
    throw err;
  }
  if (data.length * 0.75 > MAX_IMAGE_BYTES) {
    const err = new Error('Image is too large (max 4 MB)');
    err.status = 413;
    throw err;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: mimeType, data } }, { text: PROMPT }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: TRAIT_SCHEMA,
        temperature: 0.1
      }
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error((result.error && result.error.message) || `Gemini request failed (${response.status})`);
    err.status = 502;
    throw err;
  }

  const text = result.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  try {
    return JSON.parse(text);
  } catch (e) {
    const err = new Error('AI returned an unreadable response');
    err.status = 502;
    throw err;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many photo searches. Please wait a minute and try again.' });
  }

  try {
    const { image } = req.body || {};
    const traits = await analyzePetPhoto(image);
    return res.status(200).json({ success: true, traits });
  } catch (error) {
    console.error('[Photo Match Error]:', error.message);
    return res.status(error.status || 500).json({ error: error.message || 'Photo analysis failed' });
  }
};

module.exports.analyzePetPhoto = analyzePetPhoto;
module.exports.isRateLimited = isRateLimited;
