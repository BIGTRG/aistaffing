import express from 'express';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve static files from dist
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true,
}));

// SPA fallback - serve index.html for all non-file routes
app.get('/{0,}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.WEB_PORT || 3065;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Staffing web server running on port ${PORT}`);
});
