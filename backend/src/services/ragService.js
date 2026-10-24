import { config } from '../config.js';
import { embedText, generateAnswer } from './geminiService.js';
import { searchSimilarChunks } from './vectorStore.js';

export function buildContext(chunks) {
  return chunks.map((chunk, index) => `[Source ${index + 1}] ${chunk.documentId.filename}${chunk.pageNumber ? `, page ${chunk.pageNumber}` : ''}\n${chunk.text}`).join('\n\n');
}

export async function answerQuestion(question) {
  const embedding = await embedText(question);
  const matches = await searchSimilarChunks(embedding, config.topK);
  if (!matches.length || matches[0].score < 0.35) return { answer: 'I could not find enough information in the uploaded documents.', sources: [] };
  const answer = await generateAnswer(question, buildContext(matches));
  const sources = matches.map((match, index) => ({ citation: `Source ${index + 1}`, filename: match.documentId.filename, pageNumber: match.pageNumber, score: Number(match.score.toFixed(3)) }));
  return { answer, sources };
}
