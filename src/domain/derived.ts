import { CULTURES } from '../ref-data/cultures';
import type { Character } from './types';

function countVirtue(values: Character['virtues'], name: string): number {
  return values.filter((virtue) => virtue.name === name).length;
}

function countReward(values: Character['rewards'], name: string): number {
  return values.filter((reward) => reward.name === name).length;
}

export function recomputeTns(character: Character): Character {
  return {
    ...character,
    attributes: {
      ...character.attributes,
      tn_strength: 20 - character.attributes.strength,
      tn_heart: 20 - character.attributes.heart,
      tn_wits: 20 - character.attributes.wits,
    },
  };
}

export function recomputeDerivedStats(character: Character): Character {
  const formula = CULTURES[character.heroic_culture].formula;
  const hardinessBonus = (countVirtue(character.virtues, 'Hardiness') + countReward(character.rewards, 'Hardiness')) * 2;
  const confidenceBonus =
    (countVirtue(character.virtues, 'Confidence') + countReward(character.rewards, 'Confidence')) * 2;
  const nimblenessBonus = countVirtue(character.virtues, 'Nimbleness') + countReward(character.rewards, 'Nimbleness');

  const maxEndurance = character.attributes.strength + formula.endurance + hardinessBonus;
  const maxHope = character.attributes.heart + formula.hope + confidenceBonus;
  const baseParry = character.attributes.wits + formula.parry + nimblenessBonus;
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
  const reducedArmourAndHelm =
    character.cultural_blessing === 'Redoubtable' ? Math.ceil(armourAndHelm / 2) : armourAndHelm;

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
