'use strict';
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const counselorsRouter = require('../routes/counselors');
const emailRouter      = require('../routes/email');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// API routes
app.use('/api/counselors', counselorsRouter);
app.use('/api/email',      emailRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html'));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Only call listen() when running directly (local dev).
// On Vercel the exported app is used directly as a serverless function.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Counselor Directory running at http://localhost:${PORT}`);
  });
}

module.exports = app;
