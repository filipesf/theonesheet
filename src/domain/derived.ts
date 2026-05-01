import { BLESSINGS_BY_ID, legacyNameToBlessingId } from '../ref-data/blessings';
import { CULTURES } from '../ref-data/cultures';
import { legacyNameToRewardId } from '../ref-data/rewards';
import { legacyNameToVirtueId, VIRTUES_BY_ID, type VirtueEffect } from '../ref-data/virtues';
import type { Character, Reward, Virtue } from './types';

// Cultural Blessing effects partially wired in v0:
// - `attribute-plus` (Rangers / Kings of Men) adjusts the chosen attribute
//   before TN derivation, so TNs and culture-formula derived stats see the
//   bumped value.
// - `load-halve-armour-helm` (Dwarves / Redoubtable) is applied in
//   `recomputeLoad`.
// Other effects (`favoured-rolls`, `hope-magic-success`,
// `shadow-resist-bonus`, `company-society-plus`,
// `fellowship-hope-recovery-cap`) are recorded as data only; their runtime
// mechanics live outside character creation and are deferred to play-runtime
// work — see `ref-data/blessings.ts` for the deferral comment.

function resolveBlessingId(value: string): string | null {
  if (BLESSINGS_BY_ID.has(value)) return value;
  return legacyNameToBlessingId(value);
}

function isRedoubtable(character: Character): boolean {
  return resolveBlessingId(character.cultural_blessing) === 'redoubtable';
}

function resolveVirtueId(virtue: Virtue): string | null {
  return virtue.id ?? legacyNameToVirtueId(virtue.name);
}

function resolveRewardId(reward: Reward): string | null {
  return reward.id ?? legacyNameToRewardId(reward.name);
}

function virtueEffectAmount(virtues: Character['virtues'], kind: VirtueEffect['kind']): number {
  return virtues.reduce((total, virtue) => {
    const id = resolveVirtueId(virtue);
    if (!id) return total;
    const entry = VIRTUES_BY_ID.get(id);
    if (!entry) return total;
    const fromEffects = entry.effects.reduce((sum, effect) => {
      if (effect.kind !== kind) return sum;
      return sum + ('amount' in effect ? effect.amount : 0);
    }, 0);
    return total + fromEffects;
  }, 0);
}

function countReward(values: Character['rewards'], id: string): number {
  return values.filter((reward) => resolveRewardId(reward) === id).length;
}

function applyBlessingAttributePlus(character: Character): Character {
  const blessingId = resolveBlessingId(character.cultural_blessing);
  if (!blessingId) return character;
  const entry = BLESSINGS_BY_ID.get(blessingId);
  if (!entry) return character;
  const attributeBoost = entry.effects.find(
    (effect): effect is Extract<typeof effect, { kind: 'attribute-plus' }> =>
      effect.kind === 'attribute-plus',
  );
  if (!attributeBoost) return character;
  const choice = character.cultural_blessing_choice;
  if (!choice || choice.kind !== 'attribute-plus') return character;
  return {
    ...character,
    attributes: {
      ...character.attributes,
      [choice.attribute]: character.attributes[choice.attribute] + attributeBoost.amount,
    },
  };
}

function prowessTnDelta(
  virtues: Character['virtues'],
  attribute: 'strength' | 'heart' | 'wits',
): number {
  return virtues.reduce((total, virtue) => {
    const id = resolveVirtueId(virtue);
    if (id !== 'prowess') return total;
    if (virtue.selection?.kind !== 'prowess') return total;
    if (virtue.selection.attribute !== attribute) return total;
    return total - 1;
  }, 0);
}

export function recomputeTns(character: Character): Character {
  const boosted = applyBlessingAttributePlus(character);
  return {
    ...boosted,
    attributes: {
      ...boosted.attributes,
      tn_strength: 20 - boosted.attributes.strength + prowessTnDelta(boosted.virtues, 'strength'),
      tn_heart: 20 - boosted.attributes.heart + prowessTnDelta(boosted.virtues, 'heart'),
      tn_wits: 20 - boosted.attributes.wits + prowessTnDelta(boosted.virtues, 'wits'),
    },
  };
}

export function recomputeDerivedStats(character: Character): Character {
  const formula = CULTURES[character.heroic_culture].formula;
  const enduranceVirtueBonus = virtueEffectAmount(character.virtues, 'max_endurance_plus');
  const hopeVirtueBonus = virtueEffectAmount(character.virtues, 'max_hope_plus');
  const parryVirtueBonus = virtueEffectAmount(character.virtues, 'base_parry_plus');

  const hardinessRewardBonus = countReward(character.rewards, 'hardiness') * 2;
  const confidenceRewardBonus = countReward(character.rewards, 'confidence') * 2;
  const nimblenessRewardBonus = countReward(character.rewards, 'nimbleness');

  const maxEndurance = character.attributes.strength + formula.endurance + enduranceVirtueBonus + hardinessRewardBonus;
  const maxHope = character.attributes.heart + formula.hope + hopeVirtueBonus + confidenceRewardBonus;
  const baseParry = character.attributes.wits + formula.parry + parryVirtueBonus + nimblenessRewardBonus;
  const effectiveParry = baseParry + (character.war_gear.shield?.parry_bonus ?? 0);

  return {
    ...character,
    max_endurance: maxEndurance,
    max_hope: maxHope,
    base_parry: baseParry,
    effective_parry: effectiveParry,
    current_endurance: Math.min(character.current_endurance, maxEndurance),
    current_hope: Math.min(character.current_hope, maxHope),
  };
}

export function recomputeLoad(character: Character): Character {
  const weaponsLoad = character.war_gear.weapons.reduce((total, weapon) => total + weapon.load, 0);
  const armourLoad = character.war_gear.armour?.load ?? 0;
  const helmLoad = character.war_gear.helm?.load ?? 0;
  const shieldLoad = character.war_gear.shield?.load ?? 0;
  const armourAndHelm = armourLoad + helmLoad;
  const reducedArmourAndHelm = isRedoubtable(character) ? Math.ceil(armourAndHelm / 2) : armourAndHelm;

  return {
    ...character,
    load: weaponsLoad + reducedArmourAndHelm + shieldLoad + character.fatigue,
  };
}

export function recomputeConditions(character: Character): Character {
  return {
    ...character,
    conditions: {
      ...character.conditions,
      weary: character.current_endurance <= character.load,
      miserable: character.shadow >= character.current_hope,
    },
  };
}
