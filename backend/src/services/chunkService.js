export function chunkPages(pages, { maxCharacters = 1200, overlapCharacters = 180 } = {}) {
  const chunks = [];
  pages.forEach(({ pageNumber, text }) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return;
    let start = 0;
    while (start < normalized.length) {
      const end = Math.min(start + maxCharacters, normalized.length);
      const value = normalized.slice(start, end).trim();
      if (value) chunks.push({ text: value, pageNumber });
      if (end === normalized.length) break;
      start = Math.max(end - overlapCharacters, start + 1);
    }
  });
  return chunks.map((chunk, chunkIndex) => ({ ...chunk, chunkIndex }));
}
