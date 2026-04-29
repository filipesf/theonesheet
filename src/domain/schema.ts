import { CULTURES } from '../ref-data/cultures';
import { createEmptyCombatProficiencies } from '../ref-data/proficiencies';
import { createEmptySkills } from '../ref-data/skills';
import type { Character, ExportedCharacterFile, HeroicCulture } from './types';

function randomId(): string {
  return crypto.randomUUID();
}

export function createEmptyCharacter(culture: HeroicCulture = 'HOBBITS_OF_THE_SHIRE'): Character {
  const cultureData = CULTURES[culture];

  return {
    id: randomId(),
    name: 'New Hero',
    age: 20,
    heroic_culture: culture,
    cultural_blessing: cultureData.blessing,
    calling: 'TREASURE_HUNTER',
    shadow_path: 'Dragon-Sickness',
    standard_of_living: cultureData.standardOfLiving,
    attributes: {
      strength: 4,
      heart: 4,
      wits: 4,
      tn_strength: 16,
      tn_heart: 16,
      tn_wits: 16,
    },
    skills: createEmptySkills(),
    combat_proficiencies: createEmptyCombatProficiencies(),
    distinctive_features: [],
    flaws: [],
    max_endurance: 0,
    max_hope: 0,
    base_parry: 0,
    effective_parry: 0,
    current_endurance: 0,
    current_hope: 0,
    shadow: 0,
    shadow_scars: 0,
    load: 0,
    fatigue: 0,
    treasure: 0,
    conditions: {
      weary: false,
      miserable: false,
      wounded: false,
    },
    valour: 1,
    wisdom: 1,
    rewards: [],
    virtues: [],
    war_gear: {
      weapons: [],
      armour: null,
      helm: null,
      shield: null,
    },
    travelling_gear: [],
    useful_items: [],
    mount: null,
    experience: {
      skill_points: 0,
      adventure_points: 0,
      total_skill_points_spent: 0,
      total_adventure_points_spent: 0,
    },
    company_id: randomId(),
    fellowship_focus_id: null,
    heir: null,
    notes: '',
    change_log: [],
  };
}

export function toExportFile(character: Character): ExportedCharacterFile {
  return {
    schemaVersion: 'v0',
    app: 'the-one-sheet',
    exportedAt: new Date().toISOString(),
    character,
  };
}
