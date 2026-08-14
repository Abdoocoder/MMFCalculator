import { describe, expect, it, beforeEach } from 'vitest';

// Exercises the spec-shaped in-memory Storage polyfill installed in setup.ts
// (Node 22+ ships a non-functional global stub that shadows jsdom's Storage).
describe('Storage polyfill', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('stores and retrieves values with length and key indexing', () => {
    localStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
    expect(localStorage.length).toBe(1);
    expect(localStorage.key(0)).toBe('k');
  });

  it('coerces non-string values to strings', () => {
    localStorage.setItem('n', 42 as unknown as string);
    expect(localStorage.getItem('n')).toBe('42');
  });

  it('returns null for missing keys and out-of-range indexes', () => {
    expect(localStorage.getItem('missing')).toBeNull();
    expect(localStorage.key(0)).toBeNull();
    expect(sessionStorage.getItem('missing')).toBeNull();
  });

  it('removes keys and clears all entries', () => {
    localStorage.setItem('a', '1');
    localStorage.setItem('b', '2');
    localStorage.removeItem('a');
    expect(localStorage.getItem('a')).toBeNull();
    expect(localStorage.getItem('b')).toBe('2');
    localStorage.clear();
    expect(localStorage.length).toBe(0);
  });

  it('segregates localStorage and sessionStorage', () => {
    localStorage.setItem('k', 'local');
    sessionStorage.setItem('k', 'session');
    expect(sessionStorage.getItem('k')).toBe('session');
    expect(localStorage.getItem('k')).toBe('local');
    expect(sessionStorage.length).toBe(1);
    expect(localStorage.length).toBe(1);
  });

  it('throws TypeError on illegal invocation of Storage.prototype methods', () => {
    const getItem = Storage.prototype.getItem as (key: string) => string | null;
    expect(() => getItem.call({}, 'x')).toThrow(TypeError);
  });
});
