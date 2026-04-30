import { describe, expect, it } from 'vitest';
import { validateCreation } from '../../../domain/creation';
import { createEmptyCombatProficiencies } from '../../../ref-data/proficiencies';
import { createEmptySkills } from '../../../ref-data/skills';
import type { CreationDraft } from '../creationSchema';
import { draftToCharacter } from '../draftToCharacter';

function makeDraft(): CreationDraft {
  // 10 PE budget: Stealth 3 (6) + Scan 1 (1) + Athletics 1 (1) + Swords 1 (2) = 10.
  const skills = createEmptySkills().map((s) => ({
    name: s.name,
    rating:
      s.name === 'Stealth' ? 3 : s.name === 'Scan' || s.name === 'Athletics' ? 1 : 0,
    favoured: s.name === 'Stealth' || s.name === 'Scan',
  }));
  const proficiencies = createEmptyCombatProficiencies().map((p) => ({
    name: p.name,
    rating: p.name === 'SWORDS' ? 1 : 0,
  }));
  return {
    heroic_culture: 'HOBBITS_OF_THE_SHIRE',
    attribute_set_index: 0,
    strength: 4,
    heart: 5,
    wits: 5,
    skills,
    combat_proficiencies: proficiencies,
    cultural_features: ['Curious', 'Hospitable'],
    name: 'Belba Bolger',
    age: 28,
    calling: 'TREASURE_HUNTER',
    calling_feature: 'Inquisitive',
    starting_reward: 'Hardiness',
    starting_virtue: 'Mastery',
    standard_of_living: 'COMMON',
    weapons: [{ type: 'Sword', load: 2 }],
    armour: { type: 'Leather Shirt', load: 3 },
    shield: null,
  };
}

describe('draftToCharacter', () => {
  it('produces a normalised character that passes validateCreation without blocking issues', () => {
    const draft = makeDraft();
    const character = draftToCharacter(draft);
    const blocking = validateCreation(character).filter((issue) => issue.blocking);
    expect(blocking).toEqual([]);
    expect(character.distinctive_features).toEqual(['Curious', 'Hospitable', 'Inquisitive']);
    expect(character.cultural_blessing).toBe('Hobbit-Sense');
    expect(character.shadow_path).toBe('Dragon-Sickness');
  });

  it('seeds current endurance/hope to their max values', () => {
    const character = draftToCharacter(makeDraft());
    expect(character.current_endurance).toBe(character.max_endurance);
    expect(character.current_hope).toBe(character.max_hope);
  });
});
