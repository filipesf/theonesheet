import { describe, expect, it } from 'vitest';
import { CALLINGS } from '../../domain/types';
import { CALLINGS_DATA, SHADOW_PATHS } from '../callings';

const KNOWN_SKILL_IDS = new Set([
  'awe',
  'athletics',
  'awareness',
  'hunting',
  'song',
  'craft',
  'enhearten',
  'travel',
  'insight',
  'healing',
  'courtesy',
  'battle',
  'persuade',
  'stealth',
  'scan',
  'explore',
  'riddle',
  'lore',
]);

describe('CALLINGS_DATA', () => {
  it('has a row for every Calling', () => {
    for (const calling of CALLINGS) {
      expect(CALLINGS_DATA[calling]).toBeDefined();
    }
  });

  it('uses only known shadow paths', () => {
    const valid = new Set<string>(SHADOW_PATHS);
    for (const calling of CALLINGS) {
      expect(valid.has(CALLINGS_DATA[calling].shadowPath)).toBe(true);
    }
  });

  it('references only known skills as favoured', () => {
    for (const calling of CALLINGS) {
      for (const skill of CALLINGS_DATA[calling].favouredSkillIds) {
        expect(KNOWN_SKILL_IDS.has(skill)).toBe(true);
      }
    }
  });

  it('only Champion exposes Enemy-Lore options', () => {
    expect(CALLINGS_DATA.CHAMPION.enemyLoreOptions).toBeDefined();
    for (const calling of CALLINGS) {
      if (calling === 'CHAMPION') continue;
      expect(CALLINGS_DATA[calling].enemyLoreOptions).toBeUndefined();
    }
  });
});
