import { describe, expect, it } from 'vitest';
import { buildContext } from '../src/services/ragService.js';

describe('buildContext', () => {
  it('creates numbered, human-readable source context', () => {
    const context = buildContext([
      { documentId: { filename: 'guide.pdf' }, pageNumber: 2, text: 'Use small batches.' },
      { documentId: { filename: 'notes.pdf' }, pageNumber: 4, text: 'Measure outcomes.' }
    ]);
    expect(context).toContain('[Source 1] guide.pdf, page 2');
    expect(context).toContain('[Source 2] notes.pdf, page 4');
    expect(context).toContain('Use small batches.');
  });
});
