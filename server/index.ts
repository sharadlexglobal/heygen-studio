import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 32 * 1024 * 1024 } });

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || '';
const HEYGEN_BASE = 'https://api.heygen.com';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

async function heygen(method: string, endpoint: string, body?: object) {
  const res = await fetch(`${HEYGEN_BASE}${endpoint}`, {
    method,
    headers: {
      'X-Api-Key': HEYGEN_API_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// Upload MP3/audio asset
app.post('/api/assets/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    const response = await fetch(`${HEYGEN_BASE}/v3/assets`, {
      method: 'POST',
      headers: { 'X-Api-Key': HEYGEN_API_KEY, ...form.getHeaders() },
      body: form,
    });
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create video via Video Agent (prompt + optional files)
app.post('/api/videos/create', async (req, res) => {
  try {
    const data = await heygen('POST', '/v3/video-agents', req.body);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Poll Video Agent session
app.get('/api/sessions/:session_id', async (req, res) => {
  try {
    const data = await heygen('GET', `/v3/video-agents/${req.params.session_id}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lipsync: apply MP3 audio to existing video
app.post('/api/lipsync', async (req, res) => {
  try {
    const data = await heygen('POST', '/v3/lipsyncs', req.body);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get lipsync job status
app.get('/api/lipsync/:id', async (req, res) => {
  try {
    const data = await heygen('GET', `/v3/lipsyncs/${req.params.id}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List all videos
app.get('/api/videos', async (req, res) => {
  try {
    const params = new URLSearchParams();
    if (req.query.limit) params.set('limit', String(req.query.limit));
    if (req.query.token) params.set('token', String(req.query.token));
    const data = await heygen('GET', `/v3/videos?${params}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single video status
app.get('/api/videos/:id', async (req, res) => {
  try {
    const data = await heygen('GET', `/v3/videos/${req.params.id}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete video
app.delete('/api/videos/:id', async (req, res) => {
  try {
    const data = await heygen('DELETE', `/v3/videos/${req.params.id}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List avatars
app.get('/api/avatars', async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(req.query.limit || 50));
    if (req.query.ownership) params.set('ownership', String(req.query.ownership));
    if (req.query.token) params.set('token', String(req.query.token));
    const data = await heygen('GET', `/v3/avatars?${params}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List voices
app.get('/api/voices', async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(req.query.limit || 50));
    if (req.query.language) params.set('language', String(req.query.language));
    if (req.query.gender) params.set('gender', String(req.query.gender));
    if (req.query.token) params.set('token', String(req.query.token));
    const data = await heygen('GET', `/v3/voices?${params}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Translate video
app.post('/api/translate', async (req, res) => {
  try {
    const data = await heygen('POST', '/v3/video-translations', req.body);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get translation status
app.get('/api/translate/:id', async (req, res) => {
  try {
    const data = await heygen('GET', `/v3/video-translations/${req.params.id}`);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List translation languages
app.get('/api/translate-languages', async (req, res) => {
  try {
    const data = await heygen('GET', '/v3/video-translations/languages');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List styles
app.get('/api/styles', async (req, res) => {
  try {
    const data = await heygen('GET', '/v3/video-agents/styles');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = parseInt(process.env.PORT || '3000');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HeyGen Studio running on port ${PORT}`);
});
