import { describe, expect, it } from 'vitest';
import { ATTRIBUTE_SETS } from '../attribute-sets';

describe('ATTRIBUTE_SETS — canonical TOR 2e values', () => {
  it('matches DOMAIN_SPEC §6.2 row order for Dwarves of Durin\'s Folk', () => {
    expect(ATTRIBUTE_SETS.DWARVES_OF_DURINS_FOLK).toEqual([
      { strength: 7, heart: 2, wits: 5 },
      { strength: 7, heart: 3, wits: 4 },
      { strength: 6, heart: 3, wits: 5 },
      { strength: 6, heart: 4, wits: 4 },
      { strength: 5, heart: 4, wits: 5 },
      { strength: 6, heart: 2, wits: 6 },
    ]);
  });

  it('matches DOMAIN_SPEC §6.2 row order for Bardings', () => {
    expect(ATTRIBUTE_SETS.BARDINGS).toEqual([
      { strength: 5, heart: 7, wits: 2 },
      { strength: 4, heart: 7, wits: 3 },
      { strength: 5, heart: 6, wits: 3 },
      { strength: 4, heart: 6, wits: 4 },
      { strength: 5, heart: 5, wits: 4 },
      { strength: 6, heart: 6, wits: 2 },
    ]);
  });

  it('matches DOMAIN_SPEC §6.2 row order for Elves of Lindon', () => {
    expect(ATTRIBUTE_SETS.ELVES_OF_LINDON).toEqual([
      { strength: 5, heart: 2, wits: 7 },
      { strength: 4, heart: 3, wits: 7 },
      { strength: 5, heart: 3, wits: 6 },
      { strength: 4, heart: 4, wits: 6 },
      { strength: 5, heart: 4, wits: 5 },
      { strength: 6, heart: 2, wits: 6 },
    ]);
  });

  it('matches DOMAIN_SPEC §6.2 row order for Hobbits of the Shire', () => {
    expect(ATTRIBUTE_SETS.HOBBITS_OF_THE_SHIRE).toEqual([
      { strength: 3, heart: 6, wits: 5 },
      { strength: 3, heart: 7, wits: 4 },
      { strength: 2, heart: 7, wits: 5 },
      { strength: 4, heart: 6, wits: 4 },
      { strength: 4, heart: 5, wits: 5 },
      { strength: 2, heart: 6, wits: 6 },
    ]);
  });

  it('matches DOMAIN_SPEC §6.2 row order for Men of Bree', () => {
    expect(ATTRIBUTE_SETS.MEN_OF_BREE).toEqual([
      { strength: 2, heart: 5, wits: 7 },
      { strength: 3, heart: 4, wits: 7 },
      { strength: 3, heart: 5, wits: 6 },
      { strength: 4, heart: 4, wits: 6 },
      { strength: 4, heart: 5, wits: 5 },
      { strength: 2, heart: 6, wits: 6 },
    ]);
  });

  it('matches DOMAIN_SPEC §6.2 row order for Rangers of the North', () => {
    expect(ATTRIBUTE_SETS.RANGERS_OF_THE_NORTH).toEqual([
      { strength: 7, heart: 5, wits: 2 },
      { strength: 7, heart: 4, wits: 3 },
      { strength: 6, heart: 5, wits: 3 },
      { strength: 6, heart: 4, wits: 4 },
      { strength: 5, heart: 5, wits: 4 },
      { strength: 6, heart: 6, wits: 2 },
    ]);
  });

  it('exposes exactly six rows per culture', () => {
    for (const sets of Object.values(ATTRIBUTE_SETS)) {
      expect(sets).toHaveLength(6);
    }
  });

  it('every attribute total is 14 (canonical TOR 2e budget)', () => {
    for (const [culture, sets] of Object.entries(ATTRIBUTE_SETS)) {
      for (const [index, attrs] of sets.entries()) {
        const total = attrs.strength + attrs.heart + attrs.wits;
        expect(total, `${culture} row ${index + 1}`).toBe(14);
      }
    }
  });
});
