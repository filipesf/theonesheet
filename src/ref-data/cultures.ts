import type { HeroicCulture, StandardOfLiving } from '../domain/types';
import type { BlessingId } from './blessings';

type CultureFormula = {
  endurance: number;
  hope: number;
  parry: number;
};

export type CultureData = {
  blessingId: BlessingId;
  standardOfLiving: StandardOfLiving;
  formula: CultureFormula;
};

export const CULTURES: Record<HeroicCulture, CultureData> = {
  DWARVES_OF_DURINS_FOLK: {
    blessingId: 'redoubtable',
    standardOfLiving: 'PROSPEROUS',
    formula: { endurance: 22, hope: 8, parry: 10 },
  },
  BARDINGS: {
    blessingId: 'stout-hearted',
    standardOfLiving: 'PROSPEROUS',
    formula: { endurance: 20, hope: 8, parry: 12 },
  },
  ELVES_OF_LINDON: {
    blessingId: 'elven-skill',
    standardOfLiving: 'FRUGAL',
    formula: { endurance: 20, hope: 8, parry: 12 },
  },
  HOBBITS_OF_THE_SHIRE: {
    blessingId: 'hobbit-sense',
    standardOfLiving: 'COMMON',
    formula: { endurance: 18, hope: 10, parry: 12 },
  },
  MEN_OF_BREE: {
    blessingId: 'bree-blood',
    standardOfLiving: 'COMMON',
    formula: { endurance: 20, hope: 10, parry: 10 },
  },
  RANGERS_OF_THE_NORTH: {
    blessingId: 'kings-of-men',
    standardOfLiving: 'FRUGAL',
    formula: { endurance: 20, hope: 6, parry: 14 },
  },
};

export const MEDIAN_AGE_BY_CULTURE: Record<HeroicCulture, number> = {
  DWARVES_OF_DURINS_FOLK: 80,
  BARDINGS: 30,
  ELVES_OF_LINDON: 250,
  HOBBITS_OF_THE_SHIRE: 33,
  MEN_OF_BREE: 30,
  RANGERS_OF_THE_NORTH: 50,
};

// Adventuring-age windows from DOMAIN_SPEC §4.8. Used as warnings, never
// blockers — players may craft outliers narratively.
export const ADVENTURING_AGE_RANGE: Record<HeroicCulture, { min: number; max: number | null }> = {
  DWARVES_OF_DURINS_FOLK: { min: 50, max: 90 },
  BARDINGS:               { min: 18, max: 40 },
  ELVES_OF_LINDON:        { min: 100, max: null },
  HOBBITS_OF_THE_SHIRE:   { min: 20, max: 50 },
  MEN_OF_BREE:            { min: 18, max: 40 },
  RANGERS_OF_THE_NORTH:   { min: 20, max: 50 },
};

// Cultural gear restrictions from DOMAIN_SPEC §6.1. Each entry lists weapon
// or shield ids the culture may not wield. Hobbits' "Small Folk" inverts to
// an allow-list; we model it as a deny-list of everything else by tagging
// the entries it DOES allow elsewhere.
export type CulturalGearRestriction = {
  forbiddenWeaponIds?: readonly string[];
  forbiddenShieldIds?: readonly string[];
  allowedWeaponIds?: readonly string[];
};

export const CULTURAL_GEAR_RESTRICTIONS: Record<HeroicCulture, CulturalGearRestriction> = {
  DWARVES_OF_DURINS_FOLK: {
    forbiddenWeaponIds: ['great-bow', 'great-spear'],
    forbiddenShieldIds: ['great-shield'],
  },
  BARDINGS: {},
  ELVES_OF_LINDON: {},
  HOBBITS_OF_THE_SHIRE: {
    // Small Folk: dagger, bow, club, short-sword, short-spear, spear, axe, mace.
    // The basic rules' "mace" maps onto the cudgel/club family in our data.
    allowedWeaponIds: ['unarmed', 'dagger', 'cudgel', 'club', 'short-sword', 'short-spear', 'spear', 'axe', 'bow'],
    forbiddenShieldIds: ['great-shield'],
  },
  MEN_OF_BREE: {},
  RANGERS_OF_THE_NORTH: {},
};
