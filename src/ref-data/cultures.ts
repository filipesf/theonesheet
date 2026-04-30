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
