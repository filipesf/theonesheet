import type { CombatProficiency, StandardOfLiving } from '../domain/types';

export const WEAPON_GROUPS = ['sword', 'axe', 'spear', 'bow', 'brawling', 'mattock'] as const;
export type WeaponGroup = (typeof WEAPON_GROUPS)[number];

export const WEAPON_GROUP_TO_PROFICIENCY: Record<WeaponGroup, CombatProficiency['name'] | 'BRAWLING'> = {
  sword: 'SWORDS',
  axe: 'AXES',
  spear: 'SPEARS',
  bow: 'BOWS',
  mattock: 'AXES',
  brawling: 'BRAWLING',
};

export type InjuryRating = number | { oneHanded: number; twoHanded: number };

export type WeaponEntry = {
  id: string;
  group: WeaponGroup;
  damage: number;
  injury: InjuryRating;
  load: number;
  ranged: boolean;
  twoHanded: boolean | 'optional';
};

export const WEAPONS = [
  { id: 'unarmed',         group: 'brawling', damage: 1, injury: 0,                                  load: 0, ranged: false, twoHanded: false },
  { id: 'dagger',          group: 'brawling', damage: 2, injury: 14,                                 load: 0, ranged: false, twoHanded: false },
  { id: 'cudgel',          group: 'brawling', damage: 3, injury: 12,                                 load: 0, ranged: false, twoHanded: false },
  { id: 'club',            group: 'brawling', damage: 4, injury: 14,                                 load: 1, ranged: false, twoHanded: false },
  { id: 'short-sword',     group: 'sword',    damage: 3, injury: 16,                                 load: 1, ranged: false, twoHanded: false },
  { id: 'sword',           group: 'sword',    damage: 4, injury: 16,                                 load: 2, ranged: false, twoHanded: false },
  { id: 'long-sword',      group: 'sword',    damage: 5, injury: { oneHanded: 16, twoHanded: 18 },   load: 3, ranged: false, twoHanded: 'optional' },
  { id: 'short-spear',     group: 'spear',    damage: 3, injury: 14,                                 load: 2, ranged: false, twoHanded: false },
  { id: 'spear',           group: 'spear',    damage: 4, injury: { oneHanded: 14, twoHanded: 16 },   load: 3, ranged: false, twoHanded: 'optional' },
  { id: 'great-spear',     group: 'spear',    damage: 5, injury: 16,                                 load: 4, ranged: false, twoHanded: true },
  { id: 'axe',             group: 'axe',      damage: 5, injury: 18,                                 load: 2, ranged: false, twoHanded: false },
  { id: 'long-hafted-axe', group: 'axe',      damage: 6, injury: { oneHanded: 18, twoHanded: 20 },   load: 3, ranged: false, twoHanded: 'optional' },
  { id: 'great-axe',       group: 'axe',      damage: 7, injury: 20,                                 load: 4, ranged: false, twoHanded: true },
  { id: 'mattock',         group: 'mattock',  damage: 7, injury: 18,                                 load: 3, ranged: false, twoHanded: true },
  { id: 'bow',             group: 'bow',      damage: 3, injury: 14,                                 load: 2, ranged: true,  twoHanded: true },
  { id: 'great-bow',       group: 'bow',      damage: 4, injury: 16,                                 load: 4, ranged: true,  twoHanded: true },
] as const satisfies readonly WeaponEntry[];

export type WeaponId = (typeof WEAPONS)[number]['id'];

export type ArmourEntry = {
  id: string;
  protection: number;
  load: number;
  type: 'leather' | 'mail';
  restrictionMin?: StandardOfLiving;
};

export const ARMOUR = [
  { id: 'leather-shirt',   protection: 1, load: 3,  type: 'leather' },
  { id: 'leather-corslet', protection: 2, load: 6,  type: 'leather' },
  { id: 'mail-shirt',      protection: 3, load: 9,  type: 'mail', restrictionMin: 'COMMON' },
  { id: 'coat-of-mail',    protection: 4, load: 12, type: 'mail', restrictionMin: 'PROSPEROUS' },
] as const satisfies readonly ArmourEntry[];

export type ArmourId = (typeof ARMOUR)[number]['id'];

export type HelmEntry = {
  id: string;
  protectionBonus: number;
  load: number;
};

export const HELMS = [
  { id: 'helm', protectionBonus: 1, load: 4 },
] as const satisfies readonly HelmEntry[];

export type HelmId = (typeof HELMS)[number]['id'];

export type ShieldEntry = {
  id: string;
  parryBonus: number;
  load: number;
  restrictionMin?: StandardOfLiving;
};

export const SHIELDS = [
  { id: 'buckler',      parryBonus: 1, load: 2 },
  { id: 'shield',       parryBonus: 2, load: 4, restrictionMin: 'COMMON' },
  { id: 'great-shield', parryBonus: 3, load: 6, restrictionMin: 'PROSPEROUS' },
] as const satisfies readonly ShieldEntry[];

export type ShieldId = (typeof SHIELDS)[number]['id'];

const WEAPON_ID_BY_LEGACY: Record<string, WeaponId> = {
  Unarmed: 'unarmed',
  Dagger: 'dagger',
  Cudgel: 'cudgel',
  Club: 'club',
  'Short Sword': 'short-sword',
  'Short-sword': 'short-sword',
  Sword: 'sword',
  'Long Sword': 'long-sword',
  'Long-sword': 'long-sword',
  'Short Spear': 'short-spear',
  'Short-spear': 'short-spear',
  Spear: 'spear',
  'Great Spear': 'great-spear',
  'Great-spear': 'great-spear',
  Axe: 'axe',
  'Long-hafted Axe': 'long-hafted-axe',
  'Long Hafted Axe': 'long-hafted-axe',
  'Great Axe': 'great-axe',
  'Great-axe': 'great-axe',
  Mattock: 'mattock',
  Bow: 'bow',
  'Great Bow': 'great-bow',
  'Great-bow': 'great-bow',
};

const ARMOUR_ID_BY_LEGACY: Record<string, ArmourId> = {
  'Leather Shirt': 'leather-shirt',
  'Leather Corslet': 'leather-corslet',
  'Mail Shirt': 'mail-shirt',
  'Mail-shirt': 'mail-shirt',
  'Coat of Mail': 'coat-of-mail',
};

const SHIELD_ID_BY_LEGACY: Record<string, ShieldId> = {
  Buckler: 'buckler',
  Shield: 'shield',
  'Great Shield': 'great-shield',
  'Great-shield': 'great-shield',
};

export function legacyNameToWeaponId(value: string): WeaponId | null {
  return WEAPON_ID_BY_LEGACY[value] ?? null;
}

export function legacyNameToArmourId(value: string): ArmourId | null {
  return ARMOUR_ID_BY_LEGACY[value] ?? null;
}

export function legacyNameToShieldId(value: string): ShieldId | null {
  return SHIELD_ID_BY_LEGACY[value] ?? null;
}
