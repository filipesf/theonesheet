import { describe, expect, it } from 'vitest';
import { REWARDS, legacyNameToRewardId } from '../rewards';

const VALID_TARGETS = new Set(['weapon', 'armour', 'helm', 'shield', 'gear-any', 'self']);

describe('REWARDS ref-data', () => {
  it('every standard reward has parentId null', () => {
    for (const reward of REWARDS) {
      if (reward.kind === 'standard') {
        expect(reward.parentId).toBeNull();
      }
    }
  });

  it('every reward target is a known enum', () => {
    for (const reward of REWARDS) {
      expect(VALID_TARGETS.has(reward.target)).toBe(true);
    }
  });

  it('every reward id is unique', () => {
    const ids = REWARDS.map((reward) => reward.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('legacy English names map to canonical kebab-case ids', () => {
    expect(legacyNameToRewardId('Hardiness')).toBe('hardiness');
    expect(legacyNameToRewardId('Cunning Make')).toBe('cunning-make');
    expect(legacyNameToRewardId('Reinforced')).toBe('reinforced');
    expect(legacyNameToRewardId('Unknown')).toBeNull();
  });
});
