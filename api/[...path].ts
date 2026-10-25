import type { IncomingMessage, ServerResponse } from 'http';
import { handleApiRequest } from '../src/server/apiRouter';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Ensure req.url starts with /api/
    if (req.url && !req.url.startsWith('/api/')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }

    const handled = await handleApiRequest(req, res);
    if (!handled && !res.headersSent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'API route not found' }));
    }
  } catch (error: any) {
    console.error('Vercel API Handler Error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: error?.message || 'Internal Server Error' }));
    }
  }
}
