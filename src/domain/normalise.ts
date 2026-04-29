import { recomputeConditions, recomputeDerivedStats, recomputeLoad, recomputeTns } from './derived';
import type { Character } from './types';

export function normaliseCharacter(input: Character): Character {
  const withTns = recomputeTns(input);
  const withDerivedStats = recomputeDerivedStats(withTns);
  const withLoad = recomputeLoad(withDerivedStats);
  return recomputeConditions(withLoad);
}
