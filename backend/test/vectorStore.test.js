import { describe, expect, it } from 'vitest';
import { cosineSimilarity } from '../src/services/vectorStore.js';

describe('cosineSimilarity', () => {
  it('ranks matching vectors highest', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('returns zero for incompatible vectors', () => {
    expect(cosineSimilarity([], [1])).toBe(0);
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
  });
});
