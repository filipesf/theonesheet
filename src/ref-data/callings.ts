import type { Calling } from '../domain/types';
import type { SkillId } from './skills';

export const SHADOW_PATHS = [
  'dragon-sickness',
  'curse-of-vengeance',
  'lure-of-power',
  'lure-of-secrets',
  'path-of-despair',
  'wandering-madness',
] as const;

export type ShadowPath = (typeof SHADOW_PATHS)[number];

export const CALLING_DISTINCTIVE_FEATURES = [
  'burglary',
  'enemy-lore',
  'leadership',
  'rhymes-of-lore',
  'shadow-lore',
  'folk-lore',
] as const;

export type CallingDistinctiveFeature = (typeof CALLING_DISTINCTIVE_FEATURES)[number];

export const ENEMY_LORE_OPTIONS = [
  'evil-men',
  'orcs',
  'spiders',
  'trolls',
  'wargs',
  'undead',
] as const;

export type EnemyLoreType = (typeof ENEMY_LORE_OPTIONS)[number];

export type CallingData = {
  shadowPath: ShadowPath;
  favouredSkillIds: readonly SkillId[];
  distinctiveFeatureId: CallingDistinctiveFeature;
  enemyLoreOptions?: readonly EnemyLoreType[];
};

export const CALLINGS_DATA: Record<Calling, CallingData> = {
  CAPTAIN: {
    shadowPath: 'lure-of-power',
    favouredSkillIds: ['battle', 'enhearten', 'persuade'],
    distinctiveFeatureId: 'leadership',
  },
  CHAMPION: {
    shadowPath: 'curse-of-vengeance',
    favouredSkillIds: ['athletics', 'awe', 'hunting'],
    distinctiveFeatureId: 'enemy-lore',
    enemyLoreOptions: ENEMY_LORE_OPTIONS,
  },
  MESSENGER: {
    shadowPath: 'wandering-madness',
    favouredSkillIds: ['courtesy', 'song', 'travel'],
    distinctiveFeatureId: 'folk-lore',
  },
  SCHOLAR: {
    shadowPath: 'lure-of-secrets',
    favouredSkillIds: ['craft', 'lore', 'riddle'],
    distinctiveFeatureId: 'rhymes-of-lore',
  },
  TREASURE_HUNTER: {
    shadowPath: 'dragon-sickness',
    favouredSkillIds: ['explore', 'scan', 'stealth'],
    distinctiveFeatureId: 'burglary',
  },
  WARDEN: {
    shadowPath: 'path-of-despair',
    favouredSkillIds: ['awareness', 'healing', 'insight'],
    distinctiveFeatureId: 'shadow-lore',
  },
};

const SHADOW_PATH_BY_LEGACY_NAME: Record<string, ShadowPath> = {
  'Dragon-Sickness': 'dragon-sickness',
  'Curse of Vengeance': 'curse-of-vengeance',
  'Lure of Power': 'lure-of-power',
  'Lure of Secrets': 'lure-of-secrets',
  'Path of Despair': 'path-of-despair',
  'Wandering-Madness': 'wandering-madness',
};

export function legacyNameToShadowPath(value: string): ShadowPath | null {
  return SHADOW_PATH_BY_LEGACY_NAME[value] ?? null;
}
