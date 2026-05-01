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

  it('falls back to min for explicit negatives instead of stripping the sign', () => {
    expect(sanitiseDigits('-7')).toBe(0);
    expect(sanitiseDigits('-5', { min: 1 })).toBe(1);
  });

  it('drops decimal separators', () => {
    expect(sanitiseDigits('3.14')).toBe(314);
  });

  it('clamps values above max', () => {
    expect(sanitiseDigits('99', { max: 6 })).toBe(6);
    expect(sanitiseDigits('7', { min: 1, max: 6 })).toBe(6);
  });

  it('clamps values below min', () => {
    expect(sanitiseDigits('0', { min: 1 })).toBe(1);
    expect(sanitiseDigits('', { min: 1 })).toBe(1);
  });
});
