import type { HeroicCulture } from '../domain/types';

export type BlessingEffect = 'load-halve-armour-helm' | 'narrative-only';

export type BlessingEntry = {
  id: string;
  effect: BlessingEffect;
};

export const BLESSINGS = [
  { id: 'redoubtable',   effect: 'load-halve-armour-helm' },
  { id: 'stout-hearted', effect: 'narrative-only' },
  { id: 'elven-skill',   effect: 'narrative-only' },
  { id: 'hobbit-sense',  effect: 'narrative-only' },
  { id: 'bree-blood',    effect: 'narrative-only' },
  { id: 'kings-of-men',  effect: 'narrative-only' },
] as const satisfies readonly BlessingEntry[];

export type BlessingId = (typeof BLESSINGS)[number]['id'];

export const BLESSING_BY_CULTURE: Record<HeroicCulture, BlessingId> = {
  DWARVES_OF_DURINS_FOLK: 'redoubtable',
  BARDINGS: 'stout-hearted',
  ELVES_OF_LINDON: 'elven-skill',
  HOBBITS_OF_THE_SHIRE: 'hobbit-sense',
  MEN_OF_BREE: 'bree-blood',
  RANGERS_OF_THE_NORTH: 'kings-of-men',
};

const BLESSING_ID_BY_LEGACY_NAME: Record<string, BlessingId> = {
  Redoubtable: 'redoubtable',
  'Stout-Hearted': 'stout-hearted',
  'Elven-Skill': 'elven-skill',
  'Hobbit-Sense': 'hobbit-sense',
  'Bree-Blood': 'bree-blood',
  'Kings of Men': 'kings-of-men',
};

export function legacyNameToBlessingId(value: string): BlessingId | null {
  return BLESSING_ID_BY_LEGACY_NAME[value] ?? null;
}
