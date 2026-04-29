export const HEROIC_CULTURES = [
  'DWARVES_OF_DURINS_FOLK',
  'BARDINGS',
  'ELVES_OF_LINDON',
  'HOBBITS_OF_THE_SHIRE',
  'MEN_OF_BREE',
  'RANGERS_OF_THE_NORTH',
] as const;

export const CALLINGS = [
  'CAPTAIN',
  'CHAMPION',
  'MESSENGER',
  'SCHOLAR',
  'TREASURE_HUNTER',
  'WARDEN',
] as const;

export const STANDARD_OF_LIVING = ['POOR', 'FRUGAL', 'COMMON', 'PROSPEROUS', 'RICH', 'VERY_RICH'] as const;

export type HeroicCulture = (typeof HEROIC_CULTURES)[number];
export type Calling = (typeof CALLINGS)[number];
export type StandardOfLiving = (typeof STANDARD_OF_LIVING)[number];

export type Attributes = {
  strength: number;
  heart: number;
  wits: number;
  tn_strength: number;
  tn_heart: number;
  tn_wits: number;
};

export type Skill = {
  name: string;
  category: 'STRENGTH' | 'HEART' | 'WITS';
  rating: number;
  favoured: boolean;
};

export type CombatProficiency = {
  name: 'AXES' | 'BOWS' | 'SPEARS' | 'SWORDS';
  rating: number;
};

export type Reward = {
  name: string;
  origin?: 'STARTING' | 'STANDARD' | 'CULTURAL';
};

export type Virtue = {
  name: string;
  origin: 'STARTING' | 'STANDARD' | 'CULTURAL';
};

export type Weapon = {
  type: string;
  load: number;
};

export type Armour = {
  type: string;
  load: number;
};

export type Helm = {
  load: number;
};

export type Shield = {
  type: string;
  load: number;
  parry_bonus: number;
  destroyed: boolean;
};

export type WarGear = {
  weapons: Weapon[];
  armour: Armour | null;
  helm: Helm | null;
  shield: Shield | null;
};

export type Character = {
  id: string;
  name: string;
  age: number;
  heroic_culture: HeroicCulture;
  cultural_blessing: string;
  calling: Calling;
  shadow_path: string;
  standard_of_living: StandardOfLiving;
  attributes: Attributes;
  skills: Skill[];
  combat_proficiencies: CombatProficiency[];
  distinctive_features: string[];
  flaws: string[];
  max_endurance: number;
  max_hope: number;
  base_parry: number;
  effective_parry: number;
  current_endurance: number;
  current_hope: number;
  shadow: number;
  shadow_scars: number;
  load: number;
  fatigue: number;
  treasure: number;
  conditions: {
    weary: boolean;
    miserable: boolean;
    wounded: boolean;
  };
  valour: number;
  wisdom: number;
  rewards: Reward[];
  virtues: Virtue[];
  war_gear: WarGear;
  travelling_gear: string[];
  useful_items: { description: string; associated_skill: string }[];
  mount: { type: 'PONY' | 'HORSE'; quality: string; vigour: number } | null;
  experience: {
    skill_points: number;
    adventure_points: number;
    total_skill_points_spent: number;
    total_adventure_points_spent: number;
  };
  company_id: string;
  fellowship_focus_id: string | null;
  heir: null;
  notes: string;
  change_log: unknown[];
};

export type ExportedCharacterFile = {
  schemaVersion: 'v0';
  app: 'the-one-sheet';
  exportedAt: string;
  character: Character;
};
