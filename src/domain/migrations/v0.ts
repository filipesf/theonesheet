import { legacyNameToBlessingId } from '../../ref-data/blessings';
import { legacyNameToShadowPath } from '../../ref-data/callings';
import { legacyNameToDistinctiveFeatureId } from '../../ref-data/distinctive-features';
import {
  legacyNameToArmourId,
  legacyNameToShieldId,
  legacyNameToWeaponId,
} from '../../ref-data/equipment';
import { legacyNameToRewardId } from '../../ref-data/rewards';
import { legacyNameToSkillId } from '../../ref-data/skills';
import { legacyNameToVirtueId } from '../../ref-data/virtues';
import { normaliseCharacter } from '../normalise';
import type { Character } from '../types';

function backfillShadowPath(character: Character): Character {
  if (typeof character.shadow_path !== 'string' || character.shadow_path === '') {
    return character;
  }
  const mapped = legacyNameToShadowPath(character.shadow_path);
  if (!mapped) return character;
  return { ...character, shadow_path: mapped };
}

function backfillWarGearIds(character: Character): Character {
  const { war_gear } = character;
  const weapons = war_gear.weapons.map((weapon) => {
    if (weapon.id) return weapon;
    const id = legacyNameToWeaponId(weapon.type);
    return id ? { ...weapon, id } : weapon;
  });

  const armour = (() => {
    if (!war_gear.armour) return war_gear.armour;
    if (war_gear.armour.id) return war_gear.armour;
    const id = legacyNameToArmourId(war_gear.armour.type);
    return id ? { ...war_gear.armour, id } : war_gear.armour;
  })();

  const shield = (() => {
    if (!war_gear.shield) return war_gear.shield;
    if (war_gear.shield.id) return war_gear.shield;
    const id = legacyNameToShieldId(war_gear.shield.type);
    return id ? { ...war_gear.shield, id } : war_gear.shield;
  })();

  return {
    ...character,
    war_gear: { ...war_gear, weapons, armour, shield },
  };
}

function backfillVirtueIds(character: Character): Character {
  const virtues = character.virtues.map((virtue) => {
    if (virtue.id) return virtue;
    const id = legacyNameToVirtueId(virtue.name);
    return id ? { ...virtue, id } : virtue;
  });
  return { ...character, virtues };
}

function backfillRewardIds(character: Character): Character {
  const rewards = character.rewards.map((reward) => {
    if (reward.id) return reward;
    const id = legacyNameToRewardId(reward.name);
    return id ? { ...reward, id } : reward;
  });
  return { ...character, rewards };
}

function backfillSkillIds(character: Character): Character {
  const skills = character.skills.map((skill) => {
    if (skill.id) return skill;
    const id = legacyNameToSkillId(skill.name);
    return id ? { ...skill, id } : skill;
  });
  return { ...character, skills };
}

function backfillDistinctiveFeatureIds(character: Character): Character {
  const features = character.distinctive_features.map((value) => {
    const id = legacyNameToDistinctiveFeatureId(value);
    return id ?? value;
  });
  return { ...character, distinctive_features: features };
}

function backfillBlessingId(character: Character): Character {
  if (typeof character.cultural_blessing !== 'string' || character.cultural_blessing === '') {
    return character;
  }
  const mapped = legacyNameToBlessingId(character.cultural_blessing);
  if (!mapped) return character;
  return { ...character, cultural_blessing: mapped };
}

function backfillCulturalBlessingChoice(character: Character): Character {
  if (character.cultural_blessing_choice !== undefined) return character;
  return { ...character, cultural_blessing_choice: null };
}

export function migrateV0ToV0(character: Character): Character {
  return normaliseCharacter(
    backfillCulturalBlessingChoice(
      backfillDistinctiveFeatureIds(
        backfillBlessingId(
          backfillSkillIds(
            backfillRewardIds(backfillVirtueIds(backfillWarGearIds(backfillShadowPath(character)))),
          ),
        ),
      ),
    ),
  );
}
