import type { HeroicCulture } from '../domain/types';
import { CALLING_DISTINCTIVE_FEATURES, type CallingDistinctiveFeature } from './callings';

// The 24 canonical cultural Distinctive Features (DOMAIN_SPEC §6.6).
export const CANONICAL_DISTINCTIVE_FEATURES = [
  'bold',
  'cunning',
  'eager',
  'faithful',
  'fair',
  'fair-spoken',
  'fierce',
  'generous',
  'honourable',
  'inquisitive',
  'keen-eyed',
  'lordly',
  'merry',
  'patient',
  'proud',
  'rustic',
  'secretive',
  'stern',
  'subtle',
  'swift',
  'tall',
  'true-hearted',
  'wary',
  'wilful',
] as const;

export type CulturalDistinctiveFeatureId = (typeof CANONICAL_DISTINCTIVE_FEATURES)[number];

// Per-culture pool (DOMAIN_SPEC §6.5): each culture exposes 8; the player
// picks 2 during creation.
export const CULTURAL_DISTINCTIVE_FEATURES: Record<
  HeroicCulture,
  readonly CulturalDistinctiveFeatureId[]
> = {
  DWARVES_OF_DURINS_FOLK: ['cunning', 'wary', 'fierce', 'lordly', 'proud', 'stern', 'secretive', 'wilful'],
  BARDINGS:               ['tall', 'eager', 'fair', 'bold', 'fierce', 'generous', 'proud', 'stern'],
  ELVES_OF_LINDON:        ['swift', 'merry', 'fair', 'wary', 'lordly', 'keen-eyed', 'patient', 'subtle'],
  HOBBITS_OF_THE_SHIRE:   ['merry', 'eager', 'fair-spoken', 'faithful', 'honourable', 'inquisitive', 'keen-eyed', 'rustic'],
  MEN_OF_BREE:            ['cunning', 'inquisitive', 'fair-spoken', 'faithful', 'generous', 'patient', 'rustic', 'true-hearted'],
  RANGERS_OF_THE_NORTH:   ['swift', 'tall', 'bold', 'honourable', 'stern', 'secretive', 'true-hearted', 'subtle'],
} as const;

export type DistinctiveFeatureId = CulturalDistinctiveFeatureId | CallingDistinctiveFeature;

const CALLING_DISTINCTIVE_FEATURE_SET = new Set<string>(CALLING_DISTINCTIVE_FEATURES);
const CANONICAL_FEATURE_SET = new Set<string>(CANONICAL_DISTINCTIVE_FEATURES);

export function isCallingDistinctiveFeatureId(value: string): value is CallingDistinctiveFeature {
  return CALLING_DISTINCTIVE_FEATURE_SET.has(value);
}

export function isCulturalDistinctiveFeatureId(value: string): value is CulturalDistinctiveFeatureId {
  return CANONICAL_FEATURE_SET.has(value);
}

export function isKnownDistinctiveFeatureId(value: string): boolean {
  return CANONICAL_FEATURE_SET.has(value) || CALLING_DISTINCTIVE_FEATURE_SET.has(value);
}

// Pre-Phase-3 IDs that are not in the canonical 24. Stored characters may
// still hold them; the migration maps each to its closest canonical
// equivalent. The mappings are documented inline.
const DEPRECATED_TO_CANONICAL: Record<string, CulturalDistinctiveFeatureId> = {
  grim: 'stern',          // Dwarves / Rangers — closest semantic match.
  robust: 'fierce',       // Dwarves.
  curious: 'inquisitive', // Elves / Hobbits.
  eloquent: 'fair-spoken', // Elves.
  mirthful: 'merry',      // Elves.
  wise: 'patient',        // Elves / Rangers — patience reads closer than honour.
  cheerful: 'merry',      // Hobbits.
  hospitable: 'faithful', // Hobbits.
  bluff: 'true-hearted',  // Bree.
  cautious: 'patient',    // Bree.
  honest: 'true-hearted', // Bree.
  steadfast: 'faithful',  // Bree.
  stout: 'cunning',       // Bree — "stout" in Devir basic rules is canon-adjacent only.
  trusty: 'faithful',     // Bree.
  just: 'honourable',     // Rangers.
  vigilant: 'wary',       // Rangers.
};

export function deprecatedDistinctiveFeatureCanonical(value: string): CulturalDistinctiveFeatureId | null {
  return DEPRECATED_TO_CANONICAL[value] ?? null;
}

const LEGACY_NAME_TO_ID: Record<string, DistinctiveFeatureId> = {
  Bold: 'bold',
  Cunning: 'cunning',
  Eager: 'eager',
  Faithful: 'faithful',
  Fair: 'fair',
  'Fair-Spoken': 'fair-spoken',
  'Fair-spoken': 'fair-spoken',
  Fierce: 'fierce',
  Generous: 'generous',
  Honourable: 'honourable',
  Inquisitive: 'inquisitive',
  'Keen-Eyed': 'keen-eyed',
  Lordly: 'lordly',
  Merry: 'merry',
  Patient: 'patient',
  Proud: 'proud',
  Rustic: 'rustic',
  Secretive: 'secretive',
  Stern: 'stern',
  Subtle: 'subtle',
  Swift: 'swift',
  Tall: 'tall',
  'True-Hearted': 'true-hearted',
  Wary: 'wary',
  Wilful: 'wilful',
  Burglary: 'burglary',
  'Enemy-Lore': 'enemy-lore',
  Leadership: 'leadership',
  'Rhymes of Lore': 'rhymes-of-lore',
  'Shadow-Lore': 'shadow-lore',
  'Folk-Lore': 'folk-lore',
};

export function legacyNameToDistinctiveFeatureId(value: string): DistinctiveFeatureId | null {
  return LEGACY_NAME_TO_ID[value] ?? null;
}

const CULTURE_BY_FEATURE_ID = (() => {
  const map = new Map<string, HeroicCulture>();
  for (const [culture, ids] of Object.entries(CULTURAL_DISTINCTIVE_FEATURES) as [HeroicCulture, readonly string[]][]) {
    for (const id of ids) {
      if (!map.has(id)) map.set(id, culture);
    }
  }
  return map;
})();

export function findCultureForFeature(id: string): HeroicCulture | null {
  return CULTURE_BY_FEATURE_ID.get(id) ?? null;
}

export { CALLING_DISTINCTIVE_FEATURES };
