import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true, trim: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  status: { type: String, enum: ['processing', 'completed', 'failed'], required: true },
  errorMessage: String
}, { timestamps: true });

export const DocumentModel = mongoose.model('Document', documentSchema);
