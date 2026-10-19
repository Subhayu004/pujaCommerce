import express from 'express';
import cookieParser from 'cookie-parser';
import { initDatabase } from '../server/db.js';
import { authMiddleware } from '../server/auth.js';
import { apiRouter } from '../server/routes.js';

initDatabase();

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());
app.use(authMiddleware);

// Mount API routes
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
