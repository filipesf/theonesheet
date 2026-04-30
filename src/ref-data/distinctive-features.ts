import type { HeroicCulture } from '../domain/types';
import { CALLING_DISTINCTIVE_FEATURES, type CallingDistinctiveFeature } from './callings';

export const CULTURAL_DISTINCTIVE_FEATURES: Record<HeroicCulture, readonly string[]> = {
  DWARVES_OF_DURINS_FOLK: ['bold', 'grim', 'keen-eyed', 'proud', 'robust', 'stern'],
  BARDINGS:               ['cunning', 'fair-spoken', 'generous', 'lordly', 'patient', 'tall'],
  ELVES_OF_LINDON:        ['curious', 'eloquent', 'fair', 'lordly', 'mirthful', 'wise'],
  HOBBITS_OF_THE_SHIRE:   ['cheerful', 'curious', 'hospitable', 'inquisitive', 'keen-eyed', 'merry'],
  MEN_OF_BREE:            ['bluff', 'cautious', 'honest', 'steadfast', 'stout', 'trusty'],
  RANGERS_OF_THE_NORTH:   ['fair-spoken', 'grim', 'just', 'patient', 'vigilant', 'wise'],
} as const;

export type CulturalDistinctiveFeatureId =
  (typeof CULTURAL_DISTINCTIVE_FEATURES)[HeroicCulture][number];

export type DistinctiveFeatureId = CulturalDistinctiveFeatureId | CallingDistinctiveFeature;

const CALLING_DISTINCTIVE_FEATURE_SET = new Set<string>(CALLING_DISTINCTIVE_FEATURES);

export function isCallingDistinctiveFeatureId(value: string): value is CallingDistinctiveFeature {
  return CALLING_DISTINCTIVE_FEATURE_SET.has(value);
}

const ALL_KNOWN_FEATURE_IDS = new Set<string>([
  ...CALLING_DISTINCTIVE_FEATURES,
  ...Object.values(CULTURAL_DISTINCTIVE_FEATURES).flat(),
]);

export function isKnownDistinctiveFeatureId(value: string): boolean {
  return ALL_KNOWN_FEATURE_IDS.has(value);
}

const LEGACY_NAME_TO_ID: Record<string, DistinctiveFeatureId> = {
  Bold: 'bold',
  Grim: 'grim',
  'Keen-Eyed': 'keen-eyed',
  Proud: 'proud',
  Robust: 'robust',
  Stern: 'stern',
  Cunning: 'cunning',
  'Fair-spoken': 'fair-spoken',
  Generous: 'generous',
  Lordly: 'lordly',
  Patient: 'patient',
  Tall: 'tall',
  Curious: 'curious',
  Eloquent: 'eloquent',
  Fair: 'fair',
  Mirthful: 'mirthful',
  Wise: 'wise',
  Cheerful: 'cheerful',
  Hospitable: 'hospitable',
  Inquisitive: 'inquisitive',
  Merry: 'merry',
  Bluff: 'bluff',
  Cautious: 'cautious',
  Honest: 'honest',
  Steadfast: 'steadfast',
  Stout: 'stout',
  Trusty: 'trusty',
  Just: 'just',
  Vigilant: 'vigilant',
  Burglary: 'burglary',
  'Enemy-Lore': 'enemy-lore',
  Leadership: 'leadership',
  'Rhymes of Lore': 'rhymes-of-lore',
  'Shadow-Lore': 'shadow-lore',
  'Folk-Lore': 'folk-lore',
};

export function legacyNameToDistinctiveFeatureId(value: string): DistinctiveFeatureId | null {
  return (LEGACY_NAME_TO_ID[value] as DistinctiveFeatureId | undefined) ?? null;
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
