import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { config } from './config.js';
import { documentRoutes } from './routes/documentRoutes.js';
import { queryRoutes } from './routes/queryRoutes.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/documents', documentRoutes);
app.use('/api/query', queryRoutes);
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : 'Invalid upload.' });
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ error: statusCode === 500 ? 'Internal server error.' : error.message });
});
