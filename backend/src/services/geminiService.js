import axios from 'axios';
import { config } from '../config.js';

function requireApiKey() {
  if (!config.geminiApiKey) throw Object.assign(new Error('GEMINI_API_KEY is not configured on the server.'), { statusCode: 503 });
}

export async function embedText(text) {
  requireApiKey();
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.embeddingModel}:embedContent?key=${config.geminiApiKey}`,
      { content: { parts: [{ text }] }, taskType: 'RETRIEVAL_DOCUMENT' },
      { timeout: 30000 }
    );
    return response.data.embedding.values;
  } catch {
    throw Object.assign(new Error('Gemini embedding request failed. Check the API key and embedding model.'), { statusCode: 502 });
  }
}

export async function generateAnswer(question, context) {
  requireApiKey();
  const prompt = `You are DocuMind, a precise document assistant. Answer using only the context below. If it is insufficient, say exactly: "I could not find enough information in the uploaded documents." Do not guess. Cite supporting sources inline as [Source N].

Question: ${question}

Context:
${context}`;
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.generationModel}:generateContent?key=${config.geminiApiKey}`,
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 700 } },
      { timeout: 30000 }
    );
    return response.data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim() || 'I could not generate an answer.';
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    throw Object.assign(new Error(status === 429 ? 'Gemini rate limit reached. Please try again shortly.' : 'Gemini request failed. Check the API key and model configuration.'), { statusCode: status === 429 ? 429 : 502 });
  }
}
