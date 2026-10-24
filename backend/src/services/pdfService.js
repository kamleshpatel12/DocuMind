import pdfParse from 'pdf-parse';

export async function extractPdf(buffer) {
  const result = await pdfParse(buffer);
  const pages = result.text.split('\f').map((text, index) => ({ pageNumber: index + 1, text }));
  if (!pages.some(({ text }) => text.trim())) {
    throw Object.assign(new Error('This PDF has no extractable text. Scanned PDFs require OCR, which is not included.'), { statusCode: 422 });
  }
  return { pageCount: result.numpages, pages };
}
