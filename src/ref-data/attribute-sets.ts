import type { HeroicCulture } from '../domain/types';

/**
 * v0 stub: every culture exposes the same six rows so the wizard can flow.
 * Per-culture canonical attribute sets (PRD §6.2) are deferred to a future wave.
 */

export type AttributeSet = {
  strength: number;
  heart: number;
  wits: number;
};

const GENERIC_SETS: AttributeSet[] = [
  { strength: 7, heart: 6, wits: 4 },
  { strength: 6, heart: 7, wits: 4 },
  { strength: 6, heart: 4, wits: 7 },
  { strength: 5, heart: 6, wits: 6 },
  { strength: 4, heart: 6, wits: 7 },
  { strength: 4, heart: 7, wits: 6 },
];

export const ATTRIBUTE_SETS: Record<HeroicCulture, AttributeSet[]> = {
  DWARVES_OF_DURINS_FOLK: GENERIC_SETS,
  BARDINGS: GENERIC_SETS,
  ELVES_OF_LINDON: GENERIC_SETS,
  HOBBITS_OF_THE_SHIRE: GENERIC_SETS,
  MEN_OF_BREE: GENERIC_SETS,
  RANGERS_OF_THE_NORTH: GENERIC_SETS,
};
