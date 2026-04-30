import { describe, expect, it } from 'vitest';
import { sanitiseDigits } from '../numeric-input';

describe('sanitiseDigits', () => {
  it('returns 0 for an empty string', () => {
    expect(sanitiseDigits('')).toBe(0);
  });

  it('parses a simple integer', () => {
    expect(sanitiseDigits('42')).toBe(42);
  });

  it('strips non-digit characters and parses what remains', () => {
    expect(sanitiseDigits('12abc34')).toBe(1234);
  });

  it('returns 0 when the input has no digits at all', () => {
    expect(sanitiseDigits('abc')).toBe(0);
  });

  it('drops leading minus signs (negative numbers are not allowed)', () => {
    expect(sanitiseDigits('-7')).toBe(7);
  });

  it('drops decimal separators', () => {
    expect(sanitiseDigits('3.14')).toBe(314);
  });
});
