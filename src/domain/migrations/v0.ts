import { legacyNameToBlessingId } from '../../ref-data/blessings';
import { legacyNameToShadowPath } from '../../ref-data/callings';
import {
  deprecatedDistinctiveFeatureCanonical,
  legacyNameToDistinctiveFeatureId,
} from '../../ref-data/distinctive-features';
import {
  legacyNameToArmourId,
  legacyNameToShieldId,
  legacyNameToWeaponId,
} from '../../ref-data/equipment';
import { isPatronId, legacyNameToPatronId } from '../../ref-data/patrons';
import { legacyNameToRewardId } from '../../ref-data/rewards';
import { legacyNameToSkillId } from '../../ref-data/skills';
import {
  deprecatedVirtueIdCanonical,
  legacyNameToVirtueId,
  type VirtueId,
} from '../../ref-data/virtues';
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
    const withRewards = weapon.rewards_applied ? weapon : { ...weapon, rewards_applied: [] };
    if (withRewards.id) return withRewards;
    const id = legacyNameToWeaponId(withRewards.type);
    return id ? { ...withRewards, id } : withRewards;
  });

  const armour = (() => {
    if (!war_gear.armour) return war_gear.armour;
    const withRewards = war_gear.armour.rewards_applied
      ? war_gear.armour
      : { ...war_gear.armour, rewards_applied: [] };
    if (withRewards.id) return withRewards;
    const id = legacyNameToArmourId(withRewards.type);
    return id ? { ...withRewards, id } : withRewards;
  })();

  const helm = (() => {
    if (!war_gear.helm) return war_gear.helm;
    return war_gear.helm.rewards_applied
      ? war_gear.helm
      : { ...war_gear.helm, rewards_applied: [] };
  })();

  const shield = (() => {
    if (!war_gear.shield) return war_gear.shield;
    const withRewards = war_gear.shield.rewards_applied
      ? war_gear.shield
      : { ...war_gear.shield, rewards_applied: [] };
    if (withRewards.id) return withRewards;
    const id = legacyNameToShieldId(withRewards.type);
    return id ? { ...withRewards, id } : withRewards;
  })();

  return {
    ...character,
    war_gear: { ...war_gear, weapons, armour, helm, shield },
  };
}

function backfillVirtueIds(character: Character): Character {
  const virtues = character.virtues.map((virtue) => {
    // Phase 3.3 renamed Bree and Rangers cultural virtues to canonical Devir
    // pt-BR ids. If we have a stored id, swap to canonical before lookup.
    if (virtue.id) {
      const canonical = deprecatedVirtueIdCanonical(virtue.id);
      return canonical ? { ...virtue, id: canonical } : virtue;
    }
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
    if (id) return id;
    // Phase 3.2 collapsed the per-culture DF pools into a canonical 24.
    // Translate any pre-Phase-3 id into its closest canonical equivalent
    // so the UI can render it from the new i18n bundle.
    const canonical = deprecatedDistinctiveFeatureCanonical(value);
    if (canonical) return canonical;
    return value;
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

function backfillWound(character: Character): Character {
  if (typeof character.wound === 'string') return character;
  return { ...character, wound: '' };
}

function backfillFellowshipFocusIds(character: Character): Character {
  // The shape changed from singleton `fellowship_focus_id: string | null` to
  // canonical `fellowship_focus_ids: readonly string[]`. Stored v0 files may
  // still carry the legacy field — read it via a permissive cast.
  const loose = character as Character & { fellowship_focus_id?: string | null };
  if (Array.isArray(character.fellowship_focus_ids)) return character;
  const legacy = loose.fellowship_focus_id ?? null;
  const ids = legacy ? [legacy] : [];
  return { ...character, fellowship_focus_ids: ids };
}

function backfillConditions(character: Character): Character {
  const c = character.conditions ?? { weary: false, miserable: false, wounded: false };
  return {
    ...character,
    conditions: {
      weary: c.weary ?? false,
      miserable: c.miserable ?? false,
      wounded: c.wounded ?? false,
      overwhelmed: c.overwhelmed ?? false,
      dying: c.dying ?? false,
      unconscious: c.unconscious ?? false,
    },
  };
}

function backfillShadowPathStep(character: Character): Character {
  if (typeof character.shadow_path_step === 'number') return character;
  return { ...character, shadow_path_step: Math.min(character.flaws?.length ?? 0, 4) };
}

const LEGACY_VIRTUE_REWARD_IDS = new Set<VirtueId>(['hardiness', 'confidence', 'nimbleness']);

function migrateLegacyVirtueRewardsToVirtues(character: Character): Character {
  // Phase 0.3 corrected the canon: Hardiness / Confidence / Nimbleness are
  // *Virtues*, not Rewards. v0 characters may still hold them in `rewards`
  // (Belba's pre-Phase-0 worked example, and any user-imported file). Move
  // them into `virtues` if absent there, preserving the original origin.
  const legacyRewards = character.rewards.filter((reward) => {
    const id = reward.id ?? legacyNameToRewardId(reward.name);
    return id != null && LEGACY_VIRTUE_REWARD_IDS.has(id as VirtueId);
  });
  if (legacyRewards.length === 0) return character;

  const existingVirtueIds = new Set<string>(
    character.virtues
      .map((virtue) => virtue.id ?? legacyNameToVirtueId(virtue.name))
      .filter((id): id is NonNullable<typeof id> => id != null),
  );
  const remainingRewards = character.rewards.filter((reward) => {
    const id = reward.id ?? legacyNameToRewardId(reward.name);
    return id == null || !LEGACY_VIRTUE_REWARD_IDS.has(id as VirtueId);
  });
  const promotedVirtues = legacyRewards
    .map((reward) => {
      const id = (reward.id ?? legacyNameToRewardId(reward.name)) as VirtueId;
      return existingVirtueIds.has(id)
        ? null
        : { id, name: reward.name, origin: reward.origin ?? 'STARTING' };
    })
    .filter((virtue): virtue is { id: VirtueId; name: string; origin: 'STARTING' | 'STANDARD' | 'CULTURAL' } => virtue !== null);

  return {
    ...character,
    rewards: remainingRewards,
    virtues: [...character.virtues, ...promotedVirtues],
  };
}

function backfillPatronId(character: Character): Character {
  if (!character.company_id) return character;
  if (isPatronId(character.company_id)) return character;
  // Pre-Phase-3 patron ids `beorn`, `bard`, `dain`, `thranduil`, `radagast`
  // are no longer canonical. Try the legacy name map; otherwise leave the
  // string in place (UI falls back to the raw value).
  const mapped = legacyNameToPatronId(character.company_id);
  return mapped ? { ...character, company_id: mapped } : character;
}

export function migrateV0ToV0(character: Character): Character {
  return normaliseCharacter(
    backfillShadowPathStep(
      backfillConditions(
        backfillFellowshipFocusIds(
          backfillPatronId(
            migrateLegacyVirtueRewardsToVirtues(
              backfillWound(
                backfillCulturalBlessingChoice(
                  backfillDistinctiveFeatureIds(
                    backfillBlessingId(
                      backfillSkillIds(
                        backfillRewardIds(
                          backfillVirtueIds(backfillWarGearIds(backfillShadowPath(character))),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
