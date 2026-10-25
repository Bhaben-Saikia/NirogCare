/**
 * NirogCare Server - Cloud Run Persistent HTTP + WebSocket Server (`src/server/cloudRunServer.ts`)
 *
 * Designed for Google Cloud Run in `asia-south1` (Mumbai) with `minInstances = 1`.
 * Pre-warms upstream Gemini & ElevenLabs connections at startup and serves:
 *   - `WS  /api/ws/chat?token=...` (Authenticated bidirectional streaming voice + avatar pipeline)
 *   - `POST /api/*` (REST / SSE endpoints via `handleApiRequest`)
 *   - Static production frontend assets from `dist/`
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { handleApiRequest } from './apiRouter';
import { attachWsChatServer } from './wsChatServer';
import { prewarmUpstreamConnections } from './authSession';

const PORT = Number(process.env.PORT || 8080);
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary'
};

const server = http.createServer(async (req, res) => {
  const handled = await handleApiRequest(req, res);
  if (handled) return;

  const urlPath = (req.url || '/').split('?')[0];
  const candidate = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
  const safePath = candidate.startsWith(DIST_DIR) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()
    ? candidate
    : path.join(DIST_DIR, 'index.html');

  if (fs.existsSync(safePath)) {
    const ext = path.extname(safePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    fs.createReadStream(safePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

attachWsChatServer(server);

server.listen(PORT, '0.0.0.0', () => {
  console.info(`[CloudRunServer] Listening on port ${PORT} (region=${process.env.K_SERVICE_REGION || 'asia-south1'})`);
  prewarmUpstreamConnections().catch(() => {
    // Ignore initial prewarm error
  });
});
