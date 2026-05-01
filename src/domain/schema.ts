import { createEmptyCombatProficiencies } from '../ref-data/proficiencies';
import { createEmptySkills } from '../ref-data/skills';
import { migrateV0ToV0 } from './migrations/v0';
import type { Character, ExportedCharacterFile, HeroicCulture } from './types';

function randomId(): string {
  return crypto.randomUUID();
}

export function createEmptyCharacter(culture: HeroicCulture = 'HOBBITS_OF_THE_SHIRE'): Character {
  return {
    id: randomId(),
    name: '',
    age: 0,
    heroic_culture: culture,
    cultural_blessing: '',
    cultural_blessing_choice: null,
    calling: 'CAPTAIN',
    shadow_path: '',
    standard_of_living: 'COMMON',
    attributes: {
      strength: 0,
      heart: 0,
      wits: 0,
      tn_strength: 20,
      tn_heart: 20,
      tn_wits: 20,
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
    valour: 0,
    wisdom: 0,
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
    company_id: '',
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

export function createBelbaWorkedExample(): Character {
  const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
  character.name = 'Belba Bolger';
  character.age = 28;
  character.calling = 'TREASURE_HUNTER';
  character.shadow_path = 'Dragon-Sickness';
  character.company_id = 'gandalf';
  // Hobbit row 4 (4/5/5) is the canonical set matching Belba's (str/hrt/wts).
  character.attributes.strength = 4;
  character.attributes.heart = 5;
  character.attributes.wits = 5;
  character.distinctive_features = ['keen-eyed', 'inquisitive', 'burglary'];
  character.rewards = [{ name: 'Hardiness', origin: 'STARTING' }];
  character.virtues = [
    {
      name: 'Mastery',
      origin: 'STARTING',
      selection: { kind: 'mastery', skill_ids: ['explore', 'healing'] },
    },
  ];
  character.current_endurance = 24;
  character.current_hope = 15;
  character.treasure = 30;
  character.war_gear.weapons = [
    { type: 'Sword', load: 2 },
    { type: 'Bow', load: 2 },
  ];
  character.war_gear.armour = { type: 'Leather Shirt', load: 3 };
  character.experience.total_skill_points_spent = 10;
  character.experience.total_adventure_points_spent = 0;

  const favouredSkillIds = new Set(['stealth', 'scan', 'explore', 'healing', 'persuade']);
  const ratedSkillIds = new Set(['athletics', 'travel', 'hunting', 'lore']);
  character.skills = character.skills.map((skill) => {
    if (skill.id === 'stealth') {
      return { ...skill, rating: 4, favoured: true };
    }
    if (skill.id === 'scan') {
      return { ...skill, rating: 1, favoured: true };
    }
    const id = skill.id;
    if (id && ratedSkillIds.has(id)) {
      return { ...skill, rating: 1, favoured: favouredSkillIds.has(id) };
    }
    return { ...skill, favoured: id ? favouredSkillIds.has(id) : false };
  });

  character.combat_proficiencies = character.combat_proficiencies.map((proficiency) => {
    if (proficiency.name === 'SWORDS') {
      return { ...proficiency, rating: 2 };
    }
    if (proficiency.name === 'BOWS') {
      return { ...proficiency, rating: 1 };
    }
    return proficiency;
  });

  return migrateV0ToV0(character);
}
