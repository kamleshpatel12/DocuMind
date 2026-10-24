import 'dotenv/config';

const positiveInteger = (value, fallback) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`Expected a positive integer, received "${value}"`);
  return parsed;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: positiveInteger(process.env.PORT, 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/documind',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  maxUploadBytes: positiveInteger(process.env.MAX_UPLOAD_BYTES, 10 * 1024 * 1024),
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001',
  generationModel: process.env.GEMINI_GENERATION_MODEL ?? 'gemini-2.5-flash',
  topK: positiveInteger(process.env.TOP_K, 5)
};
