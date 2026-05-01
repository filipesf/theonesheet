import { describe, expect, it } from 'vitest';
import {
  attributesStep,
  callingStep,
  cultureStep,
  identityStep,
  proficienciesStep,
  skillsStep,
} from '../creationSchema';

describe('creation step schemas', () => {
  it('cultureStep accepts a known culture', () => {
    expect(
      cultureStep.parse({
        heroic_culture: 'HOBBITS_OF_THE_SHIRE',
        cultural_blessing_choice: null,
        underlined_skill_pick: 'stealth',
      }),
    ).toBeTruthy();
  });

  it('cultureStep rejects unknown values', () => {
    expect(() =>
      cultureStep.parse({
        heroic_culture: 'ELVES_OF_NOWHERE',
        cultural_blessing_choice: null,
        underlined_skill_pick: null,
      }),
    ).toThrow();
  });

  it('attributesStep rejects values outside 2..7', () => {
    expect(() =>
      attributesStep.parse({ attribute_set_index: 0, strength: 1, heart: 4, wits: 4 }),
    ).toThrow();
  });

  it('skillsStep requires exactly 18 skills', () => {
    expect(() => skillsStep.parse({ skills: [] })).toThrow();
  });

  it('proficienciesStep requires exactly 4 proficiencies', () => {
    expect(() => proficienciesStep.parse({ combat_proficiencies: [] })).toThrow();
  });

  it('identityStep rejects empty names', () => {
    expect(() => identityStep.parse({ name: '   ', age: 30 })).toThrow();
  });

  it('callingStep rejects unknown calling', () => {
    expect(() =>
      callingStep.parse({
        calling: 'BARD',
        calling_feature: 'X',
        starting_reward: 'A',
        starting_virtue: 'B',
        starting_virtue_selection: null,
        standard_of_living: 'COMMON',
        weapons: [],
        armour: null,
        shield: null,
      }),
    ).toThrow();
  });
});
