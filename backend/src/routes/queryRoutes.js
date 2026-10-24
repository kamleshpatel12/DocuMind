import { Router } from 'express';
import { answerQuestion } from '../services/ragService.js';

export const queryRoutes = Router();
queryRoutes.post('/', async (req, res, next) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    if (!question || question.length > 500) return res.status(400).json({ error: 'Question must be between 1 and 500 characters.' });
    res.json(await answerQuestion(question));
  } catch (error) { next(error); }
});
