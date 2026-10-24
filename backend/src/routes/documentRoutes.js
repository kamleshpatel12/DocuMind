import { Router } from 'express';
import multer from 'multer';
import { config } from '../config.js';
import { deleteDocument, listDocuments, processDocument } from '../services/documentService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype === 'application/pdf')
});

export const documentRoutes = Router();
documentRoutes.get('/', async (_req, res, next) => { try { res.json({ documents: await listDocuments() }); } catch (error) { next(error); } });
documentRoutes.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'A PDF file is required.' });
    res.status(201).json({ document: await processDocument(req.file) });
  } catch (error) { next(error); }
});
documentRoutes.delete('/:id', async (req, res, next) => { try { await deleteDocument(req.params.id); res.status(204).send(); } catch (error) { next(error); } });
