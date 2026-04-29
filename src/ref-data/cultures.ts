import type { HeroicCulture, StandardOfLiving } from '../domain/types';

type CultureFormula = {
  endurance: number;
  hope: number;
  parry: number;
};

export type CultureData = {
  blessing: string;
  standardOfLiving: StandardOfLiving;
  formula: CultureFormula;
};

export const CULTURES: Record<HeroicCulture, CultureData> = {
  DWARVES_OF_DURINS_FOLK: {
    blessing: 'Redoubtable',
    standardOfLiving: 'PROSPEROUS',
    formula: { endurance: 22, hope: 8, parry: 10 },
  },
  BARDINGS: {
    blessing: 'Stout-Hearted',
    standardOfLiving: 'PROSPEROUS',
    formula: { endurance: 20, hope: 8, parry: 12 },
  },
  ELVES_OF_LINDON: {
    blessing: 'Elven-Skill',
    standardOfLiving: 'FRUGAL',
    formula: { endurance: 20, hope: 8, parry: 12 },
  },
  HOBBITS_OF_THE_SHIRE: {
    blessing: 'Hobbit-Sense',
    standardOfLiving: 'COMMON',
    formula: { endurance: 18, hope: 10, parry: 12 },
  },
  MEN_OF_BREE: {
    blessing: 'Bree-Blood',
    standardOfLiving: 'COMMON',
    formula: { endurance: 20, hope: 10, parry: 10 },
  },
  RANGERS_OF_THE_NORTH: {
    blessing: 'Kings of Men',
    standardOfLiving: 'FRUGAL',
    formula: { endurance: 20, hope: 6, parry: 14 },
  },
};
