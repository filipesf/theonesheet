import type { StandardOfLiving } from '../domain/types';
import type { ArmourId, ShieldId, WeaponId } from './types';

export type StartingEquipmentSlice = {
  weaponIds: readonly WeaponId[];
  armourIds: readonly ArmourId[];
  shieldIds: readonly ShieldId[];
};

export const STARTING_EQUIPMENT_BY_SOL: Record<StandardOfLiving, StartingEquipmentSlice> = {
  POOR: {
    weaponIds: ['unarmed', 'dagger', 'cudgel', 'club', 'short-spear'],
    armourIds: ['leather-shirt'],
    shieldIds: ['buckler'],
  },
  FRUGAL: {
    weaponIds: ['dagger', 'club', 'short-sword', 'spear', 'bow'],
    armourIds: ['leather-shirt', 'leather-corslet'],
    shieldIds: ['buckler'],
  },
  COMMON: {
    weaponIds: ['short-sword', 'sword', 'spear', 'axe', 'bow'],
    armourIds: ['leather-shirt', 'leather-corslet', 'mail-shirt'],
    shieldIds: ['buckler', 'shield'],
  },
  PROSPEROUS: {
    weaponIds: ['sword', 'long-sword', 'spear', 'axe', 'long-hafted-axe', 'bow', 'great-bow'],
    armourIds: ['leather-corslet', 'mail-shirt', 'coat-of-mail'],
    shieldIds: ['shield', 'great-shield'],
  },
  RICH: {
    weaponIds: ['long-sword', 'spear', 'great-spear', 'long-hafted-axe', 'great-axe', 'bow', 'great-bow', 'mattock'],
    armourIds: ['mail-shirt', 'coat-of-mail'],
    shieldIds: ['shield', 'great-shield'],
  },
  VERY_RICH: {
    weaponIds: ['long-sword', 'great-spear', 'great-axe', 'great-bow', 'mattock'],
    armourIds: ['coat-of-mail'],
    shieldIds: ['great-shield'],
  },
};
