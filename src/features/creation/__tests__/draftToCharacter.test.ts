import { describe, expect, it } from 'vitest';
import { validateCreation } from '../../../domain/creation';
import { createEmptyCombatProficiencies } from '../../../ref-data/proficiencies';
import { createEmptySkills } from '../../../ref-data/skills';
import type { CreationDraft } from '../creationSchema';
import { draftToCharacter } from '../draftToCharacter';

function makeDraft(): CreationDraft {
  // 10 PE budget: Stealth 3 (6) + Scan 1 (1) + Athletics 1 (1) + Swords 1 (2) = 10.
  const skills = createEmptySkills().map((s) => ({
    id: s.id,
    name: s.name,
    rating:
      s.id === 'stealth' ? 3 : s.id === 'scan' || s.id === 'athletics' ? 1 : 0,
    favoured: s.id === 'stealth' || s.id === 'scan',
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
    cultural_features: ['curious', 'hospitable'],
    name: 'Belba Bolger',
    age: 28,
    calling: 'TREASURE_HUNTER',
    calling_feature: 'burglary',
    starting_reward: 'hardiness',
    starting_virtue: 'mastery',
    standard_of_living: 'COMMON',
    weapons: [{ id: 'sword', load: 2 }],
    armour: { id: 'leather-shirt', load: 3 },
    shield: null,
  };
}

describe('draftToCharacter', () => {
  it('produces a normalised character that passes validateCreation without blocking issues', () => {
    const draft = makeDraft();
    const character = draftToCharacter(draft);
    const blocking = validateCreation(character).filter((issue) => issue.blocking);
    expect(blocking).toEqual([]);
    expect(character.distinctive_features).toEqual(['curious', 'hospitable', 'burglary']);
    expect(character.cultural_blessing).toBe('hobbit-sense');
    expect(character.shadow_path).toBe('dragon-sickness');
    expect(character.rewards[0]?.id).toBe('hardiness');
    expect(character.virtues[0]?.id).toBe('mastery');
    expect(character.war_gear.weapons[0]?.id).toBe('sword');
    expect(character.war_gear.armour?.id).toBe('leather-shirt');
  });

  it('seeds current endurance/hope to their max values', () => {
    const character = draftToCharacter(makeDraft());
    expect(character.current_endurance).toBe(character.max_endurance);
    expect(character.current_hope).toBe(character.max_hope);
  });
});
