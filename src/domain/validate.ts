import { ADVENTURING_AGE_RANGE, CULTURAL_GEAR_RESTRICTIONS } from '../ref-data/cultures';
import { ARMOUR, SHIELDS } from '../ref-data/equipment';
import { STANDARD_OF_LIVING, type Character } from './types';

export type ValidationIssue = {
  field: string;
  message: string;
  severity?: 'error' | 'warning';
};

const SOL_RANK = new Map<string, number>(
  STANDARD_OF_LIVING.map((sol, index) => [sol, index]),
);
const ARMOUR_BY_ID = new Map(ARMOUR.map((entry) => [entry.id, entry]));
const SHIELD_BY_ID = new Map(SHIELDS.map((entry) => [entry.id, entry]));

function meetsSolMinimum(actual: string, required: string | undefined): boolean {
  if (!required) return true;
  const a = SOL_RANK.get(actual);
  const r = SOL_RANK.get(required);
  if (a === undefined || r === undefined) return true;
  return a >= r;
}

export function validateCharacter(character: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (character.valour < 1 || character.valour > 6) {
    issues.push({ field: 'valour', message: 'Valour must be in range 1..6.' });
  }

  if (character.wisdom < 1 || character.wisdom > 6) {
    issues.push({ field: 'wisdom', message: 'Wisdom must be in range 1..6.' });
  }

  if (character.load < 0 || character.load > character.max_endurance) {
    issues.push({ field: 'load', message: 'Load must be >= 0 and <= max endurance.' });
  }

  if (character.current_endurance < 0 || character.current_endurance > character.max_endurance) {
    issues.push({
      field: 'current_endurance',
      message: 'Current endurance must be in range 0..max_endurance.',
    });
  }

  if (character.current_hope < 0 || character.current_hope > character.max_hope) {
    issues.push({
      field: 'current_hope',
      message: 'Current hope must be in range 0..max_hope.',
    });
  }

  if (character.shadow < 0) {
    issues.push({ field: 'shadow', message: 'Shadow cannot be negative.' });
  }

  // DOMAIN_SPEC §9.3: shadow is clamped to max_hope on intake. If a stored
  // file has a higher value (older save, manual edit), surface it.
  if (character.max_hope > 0 && character.shadow > character.max_hope) {
    issues.push({
      field: 'shadow',
      message: 'Shadow cannot exceed max Hope (cap from DOMAIN_SPEC §9.3).',
    });
  }

  // DOMAIN_SPEC §11.3: Fellowship Focus cannot point at the same hero.
  if (character.fellowship_focus_ids.some((id) => id === character.id)) {
    issues.push({
      field: 'fellowship_focus_ids',
      message: 'Fellowship Focus must be a different hero.',
    });
  }

  // DOMAIN_SPEC §4.8: cultural age windows. Warning, not blocker.
  const ageRange = ADVENTURING_AGE_RANGE[character.heroic_culture];
  if (character.age > 0) {
    if (character.age < ageRange.min) {
      issues.push({
        field: 'age',
        message: `Age below the typical adventuring window for this culture (min ~${ageRange.min}).`,
        severity: 'warning',
      });
    } else if (ageRange.max != null && character.age > ageRange.max) {
      issues.push({
        field: 'age',
        message: `Age above the typical retirement age for this culture (~${ageRange.max}).`,
        severity: 'warning',
      });
    }
  }

  // DOMAIN_SPEC §4.6 / §6.1: gear is gated by Standard of Living.
  if (character.war_gear.armour?.id) {
    const entry = ARMOUR_BY_ID.get(character.war_gear.armour.id);
    const restrictionMin = entry && 'restrictionMin' in entry ? entry.restrictionMin : undefined;
    if (entry && !meetsSolMinimum(character.standard_of_living, restrictionMin)) {
      issues.push({
        field: 'war_gear.armour',
        message: `${entry.id} requires Standard of Living ≥ ${restrictionMin}.`,
      });
    }
  }
  if (character.war_gear.shield?.id) {
    const entry = SHIELD_BY_ID.get(character.war_gear.shield.id);
    const restrictionMin = entry && 'restrictionMin' in entry ? entry.restrictionMin : undefined;
    if (entry && !meetsSolMinimum(character.standard_of_living, restrictionMin)) {
      issues.push({
        field: 'war_gear.shield',
        message: `${entry.id} requires Standard of Living ≥ ${restrictionMin}.`,
      });
    }
  }

  // DOMAIN_SPEC §6.1: cultural gear restrictions.
  const culturalRestriction = CULTURAL_GEAR_RESTRICTIONS[character.heroic_culture];
  for (const weapon of character.war_gear.weapons) {
    const id = weapon.id;
    if (!id) continue;
    if (culturalRestriction.forbiddenWeaponIds?.includes(id)) {
      issues.push({
        field: 'war_gear.weapons',
        message: `${id} is forbidden for ${character.heroic_culture}.`,
      });
    }
    if (
      culturalRestriction.allowedWeaponIds &&
      !culturalRestriction.allowedWeaponIds.includes(id)
    ) {
      issues.push({
        field: 'war_gear.weapons',
        message: `${id} is outside the Small Folk weapon list for ${character.heroic_culture}.`,
      });
    }
  }
  if (
    character.war_gear.shield?.id &&
    culturalRestriction.forbiddenShieldIds?.includes(character.war_gear.shield.id)
  ) {
    issues.push({
      field: 'war_gear.shield',
      message: `${character.war_gear.shield.id} is forbidden for ${character.heroic_culture}.`,
    });
  }

  return issues;
}
