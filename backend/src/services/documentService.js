import { DocumentModel } from '../models/Document.js';
import { ChunkModel } from '../models/Chunk.js';
import { extractPdf } from './pdfService.js';
import { chunkPages } from './chunkService.js';
import { embedText } from './geminiService.js';

export async function processDocument(file) {
  const document = await DocumentModel.create({ filename: file.originalname, mimeType: file.mimetype, sizeBytes: file.size, pageCount: 0, status: 'processing' });
  try {
    const parsed = await extractPdf(file.buffer);
    const chunks = chunkPages(parsed.pages);
    if (!chunks.length) throw Object.assign(new Error('The PDF did not contain usable text.'), { statusCode: 422 });
    const embeddedChunks = [];
    for (const chunk of chunks) embeddedChunks.push({ ...chunk, documentId: document._id, embedding: await embedText(chunk.text) });
    await ChunkModel.insertMany(embeddedChunks);
    document.pageCount = parsed.pageCount;
    document.status = 'completed';
    await document.save();
    return document.toObject();
  } catch (error) {
    document.status = 'failed';
    document.errorMessage = error instanceof Error ? error.message : 'PDF processing failed';
    await document.save();
    throw error;
  }
}

export function listDocuments() {
  return DocumentModel.find().select('-errorMessage').sort({ createdAt: -1 }).lean();
}

export async function deleteDocument(id) {
  if (!/^[a-f\d]{24}$/i.test(id)) throw Object.assign(new Error('Invalid document id'), { statusCode: 400 });
  const result = await DocumentModel.findByIdAndDelete(id);
  if (!result) throw Object.assign(new Error('Document not found'), { statusCode: 404 });
  await ChunkModel.deleteMany({ documentId: id });
}
