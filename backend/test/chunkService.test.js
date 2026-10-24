import { describe, expect, it } from 'vitest';
import { chunkPages } from '../src/services/chunkService.js';

describe('chunkPages', () => {
  it('normalizes text, preserves page numbers, and overlaps long pages', () => {
    const chunks = chunkPages([{ pageNumber: 3, text: 'one two three four five six seven eight nine ten' }], { maxCharacters: 20, overlapCharacters: 5 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].pageNumber).toBe(3);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[1].text.slice(0, 5)).toBe(chunks[0].text.slice(-5));
  });

  it('skips blank pages', () => {
    expect(chunkPages([{ pageNumber: 1, text: '  \n ' }])).toEqual([]);
  });
});
