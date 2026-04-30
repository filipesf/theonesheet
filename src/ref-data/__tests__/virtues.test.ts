import { describe, expect, it } from 'vitest';
import { HEROIC_CULTURES } from '../../domain/types';
import { VIRTUES } from '../virtues';

describe('VIRTUES ref-data', () => {
  it('every cultural virtue references a known HeroicCulture', () => {
    const cultures = new Set<string>(HEROIC_CULTURES);
    for (const virtue of VIRTUES) {
      if (virtue.kind !== 'cultural') continue;
      expect(virtue.parentId).not.toBeNull();
      expect(cultures.has(virtue.parentId as string)).toBe(true);
    }
  });

  it('standard virtues all have a null parentId', () => {
    for (const virtue of VIRTUES) {
      if (virtue.kind === 'standard') {
        expect(virtue.parentId).toBeNull();
      }
    }
  });

  it('only cultural virtues carry a wisdomMin prerequisite', () => {
    for (const virtue of VIRTUES) {
      if ('wisdomMin' in virtue.prerequisites) {
        expect(virtue.kind).toBe('cultural');
      }
    }
  });

  it('every virtue id is unique', () => {
    const ids = VIRTUES.map((virtue) => virtue.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('seeds 6 standard virtues and 36 cultural virtues', () => {
    const standard = VIRTUES.filter((v) => v.kind === 'standard');
    const cultural = VIRTUES.filter((v) => v.kind === 'cultural');
    expect(standard).toHaveLength(6);
    expect(cultural).toHaveLength(36);
  });
});
