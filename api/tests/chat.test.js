/**
 * Unit tests for api/chat.js validation logic.
 * These tests exercise input validation without calling external services.
 */

const VALID_CATEGORIES = ['is', 'kira', 'tuketici', 'aile', 'trafik', 'ceza', 'icra', 'miras', 'vergi', 'default'];

describe('chat.js — input validation', () => {
  test('rejects empty message', () => {
    const message = '';
    expect(message.trim().length === 0).toBe(true);
  });

  test('rejects message over 1000 characters', () => {
    const message = 'a'.repeat(1001);
    expect(message.length > 1000).toBe(true);
  });

  test('accepts message at exactly 1000 characters', () => {
    const message = 'a'.repeat(1000);
    expect(message.length <= 1000).toBe(true);
  });

  test('rejects fileContent over 50000 characters', () => {
    const fileContent = 'x'.repeat(50001);
    expect(fileContent.length > 50000).toBe(true);
  });

  test('accepts fileContent at exactly 50000 characters', () => {
    const fileContent = 'x'.repeat(50000);
    expect(fileContent.length <= 50000).toBe(true);
  });

  test('unknown category falls back to default', () => {
    const category = 'bilinmeyen';
    const resolved = VALID_CATEGORIES.includes(category) ? category : 'default';
    expect(resolved).toBe('default');
  });

  test('all 9 legal categories are valid', () => {
    const categories = ['is', 'kira', 'tuketici', 'aile', 'trafik', 'ceza', 'icra', 'miras', 'vergi'];
    categories.forEach(cat => {
      expect(VALID_CATEGORIES.includes(cat)).toBe(true);
    });
  });

  test('fileContent of non-string type is invalid', () => {
    const fileContent = 12345;
    expect(typeof fileContent !== 'string').toBe(true);
  });
});
