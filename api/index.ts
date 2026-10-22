import express from 'express';
import cookieParser from 'cookie-parser';
import { initDatabase } from '../server/db.js';
import { authMiddleware } from '../server/auth.js';
import { apiRouter, syncMongoItemsToDatabase } from '../server/routes.js';

initDatabase();
syncMongoItemsToDatabase(true).catch(() => {});

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// Middleware to restore original request path if rewritten by Vercel
app.use((req, _res, next) => {
  const original = (req.headers['x-forwarded-uri'] as string) || (req.headers['x-matched-path'] as string);
  if (original && (req.url === '/' || req.url === '/api' || req.url === '/api/')) {
    req.url = original;
  }
  next();
});

// Mount API routes
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
