const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();

/* -------------------- Middleware -------------------- */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* -------------------- OpenAI Client -------------------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* -------------------- Health Check -------------------- */
app.get('/api/health', (req, res) => {
  res.json({ status: 'InternBuddy backend running 🚀' });
});

/* -------------------- Generate Search Query -------------------- */
app.post('/api/generate-query', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50
    });

    res.json({
      query: completion.choices[0].message.content.trim()
    });
  } catch (err) {
    console.error('Generate query error:', err);
    res.status(500).json({ error: 'query_generation_failed' });
  }
});

/* -------------------- Job Search (RapidAPI) -------------------- */
app.post('/api/search-jobs', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        query
      )}&page=1&num_pages=1`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      }
    );

    const data = await response.json();
    res.json(data.data || []);
  } catch (err) {
    console.error('Job search error:', err);
    res.status(500).json({ error: 'job_search_failed' });
  }
});

/* -------------------- Sponsor Jobs -------------------- */
app.get('/api/sponsor-jobs', (req, res) => {
  try {
    const jobs = require('./sponsor-jobs.json');
    res.json(jobs);
  } catch (err) {
    console.error('Sponsor jobs error:', err);
    res.status(500).json({ error: 'sponsor_jobs_unavailable' });
  }
});

/* -------------------- Interview Analysis -------------------- */
app.post('/api/analyze-interview', async (req, res) => {
  const { qa } = req.body;
  if (!Array.isArray(qa))
    return res.status(400).json({ error: 'qa array required' });

  const formatted = qa
    .map(
      (item, i) =>
        `${i + 1}. Q: ${item.question}\nA: ${
          item.answer || '(no answer)'
        }\nConfidence: ${item.confidence ?? 'N/A'}`
    )
    .join('\n\n');

  const systemPrompt = `
You are an expert interview coach.
Return a JSON array where each item has:
- score (0-100)
- mistakes (array of short strings)
- improvedAnswer (1-3 paragraphs)
- tips (2-3 bullet points)
Return strictly valid JSON.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: formatted }
      ]
    });

    const raw = response.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/(\[.*\])/s);
      parsed = match ? JSON.parse(match[1]) : raw;
    }

    res.json({ feedback: parsed });
  } catch (err) {
    console.error('Interview analysis error:', err);
    res.status(500).json({ error: 'analysis_failed' });
  }
});

/* -------------------- Text-to-Speech -------------------- */
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text
    });

    const audio = Buffer.from(await response.arrayBuffer());

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length
    });

    res.send(audio);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'tts_failed' });
  }
});

/* -------------------- SPA Catch-All -------------------- */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* -------------------- Server -------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`InternBuddy backend live on port ${PORT}`)
);
