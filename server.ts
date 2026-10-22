import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { initDatabase } from './server/db.js';
import { authMiddleware } from './server/auth.js';
import { apiRouter } from './server/routes.js';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  initDatabase();

  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
  app.use(cookieParser());
  app.use(authMiddleware);

  // Start FastAPI & MongoDB backend on internal port 8001 if not already running
  try {
    const fastApiDir = path.resolve(__dirname, 'fastapi_backend');
    fetch('http://127.0.0.1:8001/health').catch(() => {
      const proc = spawn('python3', [
        '-m', 'uvicorn',
        'main:app',
        '--app-dir', fastApiDir,
        '--host', '0.0.0.0',
        '--port', '8001'
      ], { stdio: 'inherit', detached: false });
      proc.on('error', (err) => console.error('[FastAPI Warning]:', err));
    });
  } catch (e) {
    console.error('[FastAPI Spawn Warning]:', e);
  }

  // Proxy to FastAPI & MongoDB service on port 8001
  app.all(['/api/fastapi/*', '/fastapi/*', '/api/fastapi', '/fastapi'], async (req, res) => {
    const targetPath = req.url.replace(/^\/api\/fastapi/, '').replace(/^\/fastapi/, '');
    const targetUrl = `http://127.0.0.1:8001${targetPath || '/'}`;
    try {
      const fetchInit: RequestInit = {
        method: req.method,
        redirect: 'follow',
        headers: {
          'Accept': 'application/json',
          'Content-Type': req.headers['content-type'] || 'application/json',
        },
      };
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        fetchInit.body = JSON.stringify(req.body);
      }
      const response = await fetch(targetUrl, fetchInit);
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return res.status(response.status).json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).send(text);
      }
    } catch (err: any) {
      return res.status(502).json({
        error: 'FastAPI Backend unreachable',
        details: err.message,
        targetUrl,
      });
    }
  });

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Catch-all for unhandled /api calls to ALWAYS return JSON 404, NEVER Vite HTML!
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  });

  // Support direct endpoints (e.g. /admin/metrics, /auth/login)
  app.use(apiRouter);

  // Any API or JSON request that wasn't handled should return JSON 404
  app.use((req, res, next) => {
    const isApi = req.path.startsWith('/api') || 
                  req.path.startsWith('/auth') || 
                  req.headers.accept?.includes('application/json');
    if (isApi && !req.path.includes('.')) {
      return res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.path}` });
    }
    next();
  });

  // Vite SPA middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  // In AI Studio dev environment, dev server must run strictly on port 3000.
  // When deployed to external platforms like Render (process.env.RENDER), use assigned PORT.
  const PORT = process.env.RENDER ? (Number(process.env.PORT) || 3000) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PujaSathi Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
