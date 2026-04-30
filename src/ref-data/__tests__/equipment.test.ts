import { describe, expect, it } from 'vitest';
import { STANDARD_OF_LIVING } from '../../domain/types';
import {
  ARMOUR,
  HELMS,
  SHIELDS,
  WEAPON_GROUP_TO_PROFICIENCY,
  WEAPON_GROUPS,
  WEAPONS,
  type ArmourEntry,
} from '../equipment';

describe('equipment ref-data', () => {
  it('maps every weapon group to a proficiency or the BRAWLING sentinel', () => {
    for (const group of WEAPON_GROUPS) {
      expect(WEAPON_GROUP_TO_PROFICIENCY[group]).toBeTruthy();
    }
  });

  it('every weapon belongs to a known group and has a non-negative load', () => {
    const groupSet = new Set<string>(WEAPON_GROUPS);
    for (const weapon of WEAPONS) {
      expect(groupSet.has(weapon.group)).toBe(true);
      expect(weapon.load).toBeGreaterThanOrEqual(0);
      expect(weapon.damage).toBeGreaterThan(0);
    }
  });

  it('armour restrictions reference a valid StandardOfLiving', () => {
    const sol = new Set<string>(STANDARD_OF_LIVING);
    const rows: readonly ArmourEntry[] = ARMOUR;
    for (const armour of rows) {
      if (armour.restrictionMin) {
        expect(sol.has(armour.restrictionMin)).toBe(true);
      }
      expect(armour.load).toBeGreaterThan(0);
      expect(armour.protection).toBeGreaterThan(0);
    }
  });

  it('shields and helms have positive load and bonuses', () => {
    for (const helm of HELMS) {
      expect(helm.load).toBeGreaterThan(0);
      expect(helm.protectionBonus).toBeGreaterThan(0);
    }
    for (const shield of SHIELDS) {
      expect(shield.load).toBeGreaterThan(0);
      expect(shield.parryBonus).toBeGreaterThan(0);
    }
  });
});
