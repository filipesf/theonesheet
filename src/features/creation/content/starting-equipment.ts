// TOR-DATA-GAP: full PRD §8 starting equipment (gear cost tables in Wave 4).
// v0 stub: a minimal SoL → gear pool map.

import type { StandardOfLiving } from '../../../domain/types';

export type StartingEquipmentSlice = {
  weapons: { type: string; load: number }[];
  armours: { type: string; load: number }[];
  shields: { type: string; load: number; parry_bonus: number }[];
};

const COMMON_WEAPONS = [
  { type: 'Axe', load: 2 },
  { type: 'Bow', load: 2 },
  { type: 'Spear', load: 2 },
  { type: 'Sword', load: 2 },
  { type: 'Dagger', load: 1 },
];

export const STARTING_EQUIPMENT: Record<StandardOfLiving, StartingEquipmentSlice> = {
  POOR: {
    weapons: COMMON_WEAPONS,
    armours: [{ type: 'Leather Shirt', load: 3 }],
    shields: [{ type: 'Buckler', load: 1, parry_bonus: 1 }],
  },
  FRUGAL: {
    weapons: COMMON_WEAPONS,
    armours: [
      { type: 'Leather Shirt', load: 3 },
      { type: 'Leather Corslet', load: 6 },
    ],
    shields: [{ type: 'Buckler', load: 1, parry_bonus: 1 }],
  },
  COMMON: {
    weapons: COMMON_WEAPONS,
    armours: [
      { type: 'Leather Shirt', load: 3 },
      { type: 'Leather Corslet', load: 6 },
      { type: 'Mail Shirt', load: 12 },
    ],
    shields: [
      { type: 'Buckler', load: 1, parry_bonus: 1 },
      { type: 'Shield', load: 3, parry_bonus: 2 },
    ],
  },
  PROSPEROUS: {
    weapons: COMMON_WEAPONS,
    armours: [
      { type: 'Leather Corslet', load: 6 },
      { type: 'Mail Shirt', load: 12 },
      { type: 'Mail Hauberk', load: 18 },
    ],
    shields: [
      { type: 'Shield', load: 3, parry_bonus: 2 },
      { type: 'Great Shield', load: 5, parry_bonus: 3 },
    ],
  },
  RICH: {
    weapons: COMMON_WEAPONS,
    armours: [
      { type: 'Mail Shirt', load: 12 },
      { type: 'Mail Hauberk', load: 18 },
    ],
    shields: [
      { type: 'Shield', load: 3, parry_bonus: 2 },
      { type: 'Great Shield', load: 5, parry_bonus: 3 },
    ],
  },
  VERY_RICH: {
    weapons: COMMON_WEAPONS,
    armours: [{ type: 'Mail Hauberk', load: 18 }],
    shields: [{ type: 'Great Shield', load: 5, parry_bonus: 3 }],
  },
};
