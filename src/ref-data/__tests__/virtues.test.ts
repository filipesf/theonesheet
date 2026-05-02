import { describe, expect, it } from 'vitest';
import { HEROIC_CULTURES } from '../../domain/types';
import { deprecatedVirtueIdCanonical, legacyNameToVirtueId, VIRTUES } from '../virtues';

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

  it('exposes the canonical Bree and Rangers virtues from DOMAIN_SPEC §10.6', () => {
    const ids = new Set<string>(VIRTUES.map((v) => v.id));
    for (const id of ['bree-pony', 'defiance', 'desperate-courage', 'friendly-and-familiar', 'pipe-smoking', 'strange-as-news-from-bree']) {
      expect(ids.has(id), `Bree virtue ${id}`).toBe(true);
    }
    for (const id of ['foresight-of-his-folk', 'heir-of-arnor', 'rangers-resilience', 'royalty-revealed', 'strider', 'strong-willed']) {
      expect(ids.has(id), `Rangers virtue ${id}`).toBe(true);
    }
  });

  it('legacy English virtue names from spec Phase 0.6/0.7 resolve to canonical ids', () => {
    const a: string | null = legacyNameToVirtueId('Bold and Hale');
    const b: string | null = legacyNameToVirtueId('Stout');
    const c: string | null = legacyNameToVirtueId('Hidden Sentinel');
    expect(a).toBe('friendly-and-familiar');
    expect(b).toBe('desperate-courage');
    expect(c).toBe('rangers-resilience');
  });

  it('deprecated pre-Phase-3 virtue ids map to their canonical replacements', () => {
    expect(deprecatedVirtueIdCanonical('crafty')).toBe('friendly-and-familiar');
    expect(deprecatedVirtueIdCanonical('foresight-of-their-kindred')).toBe('foresight-of-his-folk');
    expect(deprecatedVirtueIdCanonical('bow-mastery')).toBe('strider');
    expect(deprecatedVirtueIdCanonical('heir-of-arnor')).toBeNull();
  });
});
