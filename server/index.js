require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const { init, pool } = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.disable('x-powered-by');app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: false, // served over plain HTTP locally; enable behind HTTPS
}));
app.use(express.json({ limit: '100kb' }));

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use('/vendor/chart.js', express.static(path.join(__dirname, '..', 'node_modules', 'chart.js', 'dist')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
  if (err.code === '23503') return res.status(400).json({ error: 'Referenced record does not exist' });
  if (!err.expose) console.error(err);
  return res.status(err.status || 500).json({ error: err.expose ? err.message : 'Internal server error' });
});

init()
  .then(() => {
    const server = app.listen(PORT, HOST, () => console.log(`Daily Work Todo running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`));

    // Graceful shutdown (pm2 restart/reload/stop sends SIGINT)
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down…`);
      server.close(() => pool.end().finally(() => process.exit(0)));
      setTimeout(() => process.exit(1), 8000).unref();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
