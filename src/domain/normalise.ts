import {
  recomputeConditions,
  recomputeDerivedStats,
  recomputeLoad,
  recomputeShadowPathStep,
  recomputeStandardOfLiving,
  recomputeTns,
} from './derived';
import type { Character } from './types';

export function normaliseCharacter(input: Character): Character {
  const withTns = recomputeTns(input);
  const withDerivedStats = recomputeDerivedStats(withTns);
  const withLoad = recomputeLoad(withDerivedStats);
  const withSol = recomputeStandardOfLiving(withLoad);
  const withShadowStep = recomputeShadowPathStep(withSol);
  return recomputeConditions(withShadowStep);
}
