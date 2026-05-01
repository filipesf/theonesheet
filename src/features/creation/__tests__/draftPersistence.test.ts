import { beforeEach, describe, expect, it } from 'vitest';
import {
  DRAFT_SCHEMA_VERSION,
  DRAFT_STORAGE_KEY,
  clearDraft,
  loadDraft,
  saveDraft,
} from '../draftPersistence';
import type { CreationDraft } from '../creationSchema';

function sampleDraft(): CreationDraft {
  return {
    heroic_culture: 'HOBBITS_OF_THE_SHIRE',
    cultural_blessing_choice: null,
    underlined_skill_pick: 'stealth',
    attribute_set_index: 4,
    strength: 4,
    heart: 5,
    wits: 5,
    skills: [],
    combat_proficiencies: [],
    cultural_features: ['curious', 'hospitable'],
    name: 'Belba',
    age: 28,
    calling: 'TREASURE_HUNTER',
    calling_feature: 'burglary',
    starting_reward: 'keen',
    starting_virtue: 'mastery',
    starting_virtue_selection: { kind: 'mastery', skill_ids: ['explore', 'healing'] },
    standard_of_living: 'COMMON',
    weapons: [],
    armour: null,
    shield: null,
  } as unknown as CreationDraft;
}

describe('wizard draft persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a draft + stepIndex through saveDraft/loadDraft', () => {
    saveDraft({ draft: sampleDraft(), stepIndex: 4 });
    const loaded = loadDraft();
    expect(loaded?.stepIndex).toBe(4);
    expect(loaded?.draft.name).toBe('Belba');
    expect(loaded?.draft.heroic_culture).toBe('HOBBITS_OF_THE_SHIRE');
  });

  it('writes a versioned envelope', () => {
    saveDraft({ draft: sampleDraft(), stepIndex: 0 });
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(DRAFT_SCHEMA_VERSION);
  });

  it('drops the draft when the persisted schema version does not match', () => {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ schemaVersion: DRAFT_SCHEMA_VERSION + 1, draft: sampleDraft(), stepIndex: 0 }),
    );
    expect(loadDraft()).toBeNull();
  });

  it('drops the draft when the payload is malformed', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, '{not json');
    expect(loadDraft()).toBeNull();
  });

  it('clearDraft removes the persisted entry', () => {
    saveDraft({ draft: sampleDraft(), stepIndex: 0 });
    clearDraft();
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(loadDraft()).toBeNull();
  });
});
