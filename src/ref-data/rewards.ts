import type { Calling, HeroicCulture } from '../domain/types';
import type { WeaponGroup } from './equipment';

export type RewardEffect =
  | { kind: 'damage_plus'; amount: number }
  | { kind: 'injury_plus'; amount: number }
  | { kind: 'parry_plus'; amount: number }
  | { kind: 'protection_plus'; amount: number }
  | { kind: 'load_minus'; amount: number }
  | { kind: 'pierce_on_min_die'; min: number }
  | { kind: 'narrative_only' };

export type RewardTarget = 'weapon' | 'armour' | 'helm' | 'shield' | 'gear-any' | 'self';

export type RewardEntry = {
  id: string;
  kind: 'standard' | 'cultural' | 'calling';
  parentId: HeroicCulture | Calling | null;
  target: RewardTarget;
  weaponGroup?: WeaponGroup;
  enchanted: boolean;
  effects: readonly RewardEffect[];
};

export const REWARDS = [
  { id: 'close-fitting', kind: 'standard', parentId: null, target: 'gear-any', enchanted: false, effects: [{ kind: 'protection_plus', amount: 2 }] },
  { id: 'cunning-make',  kind: 'standard', parentId: null, target: 'gear-any', enchanted: false, effects: [{ kind: 'load_minus', amount: 2 }] },
  { id: 'fell',          kind: 'standard', parentId: null, target: 'weapon',   enchanted: false, effects: [{ kind: 'injury_plus', amount: 2 }] },
  { id: 'grievous',      kind: 'standard', parentId: null, target: 'weapon',   enchanted: false, effects: [{ kind: 'damage_plus', amount: 1 }] },
  { id: 'keen',          kind: 'standard', parentId: null, target: 'weapon',   enchanted: false, effects: [{ kind: 'pierce_on_min_die', min: 9 }] },
  { id: 'reinforced',    kind: 'standard', parentId: null, target: 'shield',   enchanted: false, effects: [{ kind: 'parry_plus', amount: 1 }] },
] as const satisfies readonly RewardEntry[];

/**
 * `LegacyVirtueRewardId` accommodates v0 characters whose `Reward.name` is one of
 * the three Virtue names that the original code-path treated as both Virtue and
 * Reward (Belba's worked example). They are not canonical Rewards in TOR 2e.
 */
export type LegacyVirtueRewardId = 'hardiness' | 'confidence' | 'nimbleness';

export type RewardId = (typeof REWARDS)[number]['id'] | LegacyVirtueRewardId;

const REWARD_ID_BY_LEGACY_NAME: Record<string, RewardId> = {
  'Close-fitting': 'close-fitting',
  'Cunning Make': 'cunning-make',
  'Cunning-make': 'cunning-make',
  Fell: 'fell',
  Grievous: 'grievous',
  Keen: 'keen',
  Reinforced: 'reinforced',
  Hardiness: 'hardiness',
  Confidence: 'confidence',
  Nimbleness: 'nimbleness',
};

export function legacyNameToRewardId(value: string): RewardId | null {
  return REWARD_ID_BY_LEGACY_NAME[value] ?? null;
}
