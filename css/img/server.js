const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const path = require('path');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// --- OpenAI endpoint (optional, for smart queries) ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/generate-query', async (req, res) => {
  const { prompt } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: prompt}],
      max_tokens: 50
    });
    res.json({ query: completion.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- JSearch (RapidAPI) endpoint for jobs/internships ---
app.post('/api/search-jobs', async (req, res) => {
  const { query } = req.body;
  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    });
    const data = await response.json();
    res.json(data.data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Sponsor jobs endpoint (reads from sponsor-jobs.json) ---
app.get('/api/sponsor-jobs', (req, res) => {
  try {
    const jobs = require('../sponsor-jobs.json');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Could not load sponsor jobs.' });
  }
});

// --- Serve frontend files (for SPA support) ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));