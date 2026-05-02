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
    cultural_blessing_choice: null,
    underlined_skill_pick: 'stealth',
    attribute_set_index: 4,
    strength: 4,
    heart: 5,
    wits: 5,
    skills,
    combat_proficiencies: proficiencies,
    cultural_features: ['inquisitive', 'keen-eyed'],
    name: 'Belba Bolger',
    age: 28,
    calling: 'TREASURE_HUNTER',
    calling_feature: 'burglary',
    starting_reward: 'keen',
    starting_reward_target: 'sword',
    starting_virtue: 'mastery',
    starting_virtue_selection: {
      kind: 'mastery',
      skill_ids: ['explore', 'healing'],
    },
    standard_of_living: 'COMMON',
    weapons: [{ id: 'sword', load: 2 }],
    armour: { id: 'leather-shirt', load: 3 },
    shield: null,
    patron_id: 'bilbo',
    safe_haven: 'Pônei Empinado (Bri)',
  };
}

describe('draftToCharacter', () => {
  it('produces a normalised character that passes validateCreation without blocking issues', () => {
    const draft = makeDraft();
    const character = draftToCharacter(draft);
    const blocking = validateCreation(character).filter((issue) => issue.blocking);
    expect(blocking).toEqual([]);
    expect(character.distinctive_features).toEqual(['inquisitive', 'keen-eyed', 'burglary']);
    expect(character.cultural_blessing).toBe('hobbit-sense');
    expect(character.shadow_path).toBe('dragon-sickness');
    expect(character.rewards[0]?.id).toBe('keen');
    expect(character.virtues[0]?.id).toBe('mastery');
    expect(character.war_gear.weapons[0]?.id).toBe('sword');
    expect(character.war_gear.armour?.id).toBe('leather-shirt');
  });

  it('seeds current endurance/hope to their max values', () => {
    const character = draftToCharacter(makeDraft());
    expect(character.current_endurance).toBe(character.max_endurance);
    expect(character.current_hope).toBe(character.max_hope);
  });

  // Regression for BUG-004: conditions used to be computed against the
  // pre-stamp current_endurance=0, then frozen — leaving newly-created
  // heroes flagged Exausto/Arrasado on the editor.
  it('clears weary/miserable on a freshly created hero with full endurance and hope', () => {
    const character = draftToCharacter(makeDraft());
    expect(character.conditions.weary).toBe(false);
    expect(character.conditions.miserable).toBe(false);
  });

  // Regression for BUG-003: the canonical Belba build (stealth 4 + Swords 2)
  // estimates to ~24 PE under the absolute-cost formula, which trips
  // previous-experience-overspent unless draftToCharacter stamps the
  // 10-PE budget directly.
  it('stamps the 10 PE budget so a canonical stealth-4 / swords-2 build finalises', () => {
    const draft = makeDraft();
    draft.skills = draft.skills.map((s) =>
      s.id === 'stealth' ? { ...s, rating: 4, favoured: true } : s,
    );
    draft.combat_proficiencies = draft.combat_proficiencies.map((p) =>
      p.name === 'SWORDS' ? { ...p, rating: 2 } : p,
    );
    const character = draftToCharacter(draft);
    expect(character.experience.total_skill_points_spent).toBe(10);
    const blocking = validateCreation(character).filter((issue) => issue.blocking);
    expect(blocking.some((i) => i.code === 'previous-experience-overspent')).toBe(false);
  });

  it('attaches the starting Reward to the targeted weapon and leaves others bare', () => {
    const draft = makeDraft();
    draft.weapons = [
      { id: 'sword', load: 2 },
      { id: 'bow', load: 2 },
    ];
    draft.starting_reward = 'keen';
    draft.starting_reward_target = 'sword';
    const character = draftToCharacter(draft);
    const sword = character.war_gear.weapons.find((w) => w.id === 'sword');
    const bow = character.war_gear.weapons.find((w) => w.id === 'bow');
    expect(sword?.rewards_applied).toEqual([
      { id: 'keen', name: 'keen', origin: 'STARTING' },
    ]);
    expect(bow?.rewards_applied).toEqual([]);
    // The character-level rewards list still mirrors the Reward for the
    // sidebar listing (BR:2470 — Reward names are also tracked at the hero
    // level so the sheet can summarise them).
    expect(character.rewards[0]?.id).toBe('keen');
  });

  it('marks the chosen underlined skill as Favoured', () => {
    const draft = makeDraft();
    draft.underlined_skill_pick = 'riddle';
    const character = draftToCharacter(draft);
    expect(character.skills.find((s) => s.id === 'riddle')?.favoured).toBe(true);
  });

  it('flips Mastery-picked skills to Favoured at construction time', () => {
    const character = draftToCharacter(makeDraft());
    expect(character.skills.find((s) => s.id === 'explore')?.favoured).toBe(true);
    expect(character.skills.find((s) => s.id === 'healing')?.favoured).toBe(true);
    expect(character.virtues[0]?.selection).toEqual({
      kind: 'mastery',
      skill_ids: ['explore', 'healing'],
    });
  });

  it('records Prowess attribute selection and shifts the chosen TN by -1', () => {
    const draft = makeDraft();
    draft.starting_virtue = 'prowess';
    draft.starting_virtue_selection = { kind: 'prowess', attribute: 'wits' };
    const character = draftToCharacter(draft);
    expect(character.virtues[0]?.selection).toEqual({ kind: 'prowess', attribute: 'wits' });
    expect(character.attributes.tn_wits).toBe(20 - 5 - 1);
  });

  it('blocks finalisation when Mastery has no selection', () => {
    const draft = makeDraft();
    draft.starting_virtue_selection = null;
    const character = draftToCharacter(draft);
    const blocking = validateCreation(character).filter((issue) => issue.blocking);
    expect(blocking.some((i) => i.code === 'mastery-selection-required')).toBe(true);
  });

  it('blocks finalisation when no underlined skill is favoured', () => {
    const draft = makeDraft();
    draft.underlined_skill_pick = null;
    // also clear stealth favouring so neither underlined skill is favoured
    draft.skills = draft.skills.map((s) =>
      s.id === 'stealth' || s.id === 'riddle' ? { ...s, favoured: false } : s,
    );
    const character = draftToCharacter(draft);
    const blocking = validateCreation(character).filter((issue) => issue.blocking);
    expect(blocking.some((i) => i.code === 'underlined-skill-required')).toBe(true);
  });

  it('Rangers: applies attribute-plus blessing to the chosen attribute and recomputes TN', () => {
    const draft = makeDraft();
    draft.heroic_culture = 'RANGERS_OF_THE_NORTH';
    draft.attribute_set_index = 4;
    draft.strength = 5;
    draft.heart = 5;
    draft.wits = 4;
    draft.cultural_blessing_choice = { kind: 'attribute-plus', attribute: 'wits' };
    draft.underlined_skill_pick = 'battle';
    // ensure none of the rangers underlined are pre-favoured
    draft.skills = draft.skills.map((s) =>
      s.id === 'battle' ? { ...s, favoured: false } : s,
    );
    const character = draftToCharacter(draft);
    expect(character.attributes.wits).toBe(5);
    expect(character.attributes.tn_wits).toBe(15);
    expect(character.skills.find((s) => s.id === 'battle')?.favoured).toBe(true);
  });
});
