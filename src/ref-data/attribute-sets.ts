import type { HeroicCulture } from '../domain/types';

/**
 * Canonical per-culture attribute sets transcribed from the TOR 2e basic
 * rulebook (`docs/THE_ONE_RING_BASIC_RULES.md`). The order mirrors the book's
 * d6 result column 1..6 and is preserved as the persisted
 * `attribute_set_index`.
 */

export type AttributeSet = {
  strength: number;
  heart: number;
  wits: number;
};

const DWARVES_OF_DURINS_FOLK_SETS = [
  { strength: 7, heart: 2, wits: 5 },
  { strength: 7, heart: 3, wits: 4 },
  { strength: 6, heart: 3, wits: 5 },
  { strength: 6, heart: 4, wits: 4 },
  { strength: 5, heart: 4, wits: 5 },
  { strength: 6, heart: 2, wits: 6 },
] as const satisfies readonly AttributeSet[];

const BARDINGS_SETS = [
  { strength: 5, heart: 7, wits: 2 },
  { strength: 4, heart: 7, wits: 3 },
  { strength: 5, heart: 6, wits: 3 },
  { strength: 4, heart: 6, wits: 4 },
  { strength: 5, heart: 5, wits: 4 },
  { strength: 6, heart: 6, wits: 2 },
] as const satisfies readonly AttributeSet[];

const ELVES_OF_LINDON_SETS = [
  { strength: 5, heart: 2, wits: 7 },
  { strength: 4, heart: 3, wits: 7 },
  { strength: 5, heart: 3, wits: 6 },
  { strength: 4, heart: 4, wits: 6 },
  { strength: 5, heart: 4, wits: 5 },
  { strength: 6, heart: 2, wits: 6 },
] as const satisfies readonly AttributeSet[];

const HOBBITS_OF_THE_SHIRE_SETS = [
  { strength: 3, heart: 6, wits: 5 },
  { strength: 3, heart: 7, wits: 4 },
  { strength: 2, heart: 7, wits: 5 },
  { strength: 4, heart: 6, wits: 4 },
  { strength: 4, heart: 5, wits: 5 },
  { strength: 2, heart: 6, wits: 6 },
] as const satisfies readonly AttributeSet[];

const MEN_OF_BREE_SETS = [
  { strength: 2, heart: 5, wits: 7 },
  { strength: 3, heart: 4, wits: 7 },
  { strength: 3, heart: 5, wits: 6 },
  { strength: 4, heart: 4, wits: 6 },
  { strength: 4, heart: 5, wits: 5 },
  { strength: 2, heart: 6, wits: 6 },
] as const satisfies readonly AttributeSet[];

const RANGERS_OF_THE_NORTH_SETS = [
  { strength: 7, heart: 5, wits: 2 },
  { strength: 7, heart: 4, wits: 3 },
  { strength: 6, heart: 5, wits: 3 },
  { strength: 6, heart: 4, wits: 4 },
  { strength: 5, heart: 5, wits: 4 },
  { strength: 6, heart: 6, wits: 2 },
] as const satisfies readonly AttributeSet[];

export const ATTRIBUTE_SETS: Record<HeroicCulture, readonly AttributeSet[]> = {
  DWARVES_OF_DURINS_FOLK: DWARVES_OF_DURINS_FOLK_SETS,
  BARDINGS: BARDINGS_SETS,
  ELVES_OF_LINDON: ELVES_OF_LINDON_SETS,
  HOBBITS_OF_THE_SHIRE: HOBBITS_OF_THE_SHIRE_SETS,
  MEN_OF_BREE: MEN_OF_BREE_SETS,
  RANGERS_OF_THE_NORTH: RANGERS_OF_THE_NORTH_SETS,
};
