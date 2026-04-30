import { beforeEach, describe, expect, it } from 'vitest';
import { appendLog, clearLog, readLog } from '../diceLogStorage';
import type { RollResult } from '../diceMechanics';

function fakeResult(seed: number): RollResult {
  return {
    id: `id-${seed}`,
    rolledAt: new Date(seed).toISOString(),
    request: {
      label: `roll-${seed}`,
      successDice: 1,
      tn: null,
      weary: false,
      miserable: false,
      characterId: 'char-1',
    },
    feat: 4,
    successDice: [3],
    successes: 0,
    total: 7,
    outcome: 'no-tn',
  };
}

describe('diceLogStorage', () => {
  beforeEach(() => localStorage.clear());

  it('reads an empty log when nothing is stored', () => {
    expect(readLog('char-1')).toEqual([]);
  });

  it('caps the log at 100 entries', () => {
    let last: RollResult[] = [];
    for (let i = 0; i < 150; i += 1) {
      last = appendLog('char-1', fakeResult(i));
    }
    expect(last).toHaveLength(100);
    expect(last[0]!.id).toBe('id-149');
  });

  it('clears the log', () => {
    appendLog('char-1', fakeResult(1));
    clearLog('char-1');
    expect(readLog('char-1')).toEqual([]);
  });

  it('returns an empty array when stored value is malformed', () => {
    localStorage.setItem('tos:dice-log:char-1', '{not json');
    expect(readLog('char-1')).toEqual([]);
  });
});
