import { describe, expect, it } from 'vitest';
import { normaliseCharacter } from '../normalise';
import { createEmptyCharacter } from '../schema';
import { validateCharacter } from '../validate';

describe('normaliseCharacter', () => {
  it('recomputes TNs and culture-based derived stats', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.attributes.wits = 5;

    const result = normaliseCharacter(character);

    expect(result.attributes.tn_strength).toBe(16);
    expect(result.attributes.tn_heart).toBe(15);
    expect(result.attributes.tn_wits).toBe(15);
    expect(result.max_endurance).toBe(22);
    expect(result.max_hope).toBe(15);
    expect(result.base_parry).toBe(17);
  });

  it('recomputes load, effective parry and conditions from gear and state', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.attributes.wits = 5;
    character.fatigue = 1;
    character.war_gear.weapons = [
      { type: 'Sword', load: 2 },
      { type: 'Bow', load: 2 },
    ];
    character.war_gear.armour = { type: 'Leather Shirt', load: 3 };
    character.war_gear.shield = { type: 'Shield', load: 4, parry_bonus: 2, destroyed: false };
    character.current_endurance = 9;
    character.current_hope = 2;
    character.shadow = 2;

    const result = normaliseCharacter(character);

    expect(result.load).toBe(12);
    expect(result.effective_parry).toBe(19);
    expect(result.conditions.weary).toBe(true);
    expect(result.conditions.miserable).toBe(true);
  });
});

describe('validateCharacter', () => {
  it('flags out-of-range fields', () => {
    const character = createEmptyCharacter();
    character.valour = 0;
    character.shadow = -1;

    const result = validateCharacter(normaliseCharacter(character));

    expect(result.some((issue) => issue.field === 'valour')).toBe(true);
    expect(result.some((issue) => issue.field === 'shadow')).toBe(true);
  });
});
