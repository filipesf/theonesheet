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

describe('Redoubtable load halving', () => {
  it('halves armour+helm load when blessing id is redoubtable', () => {
    const character = createEmptyCharacter('DWARVES_OF_DURINS_FOLK');
    character.cultural_blessing = 'redoubtable';
    character.attributes.strength = 5;
    character.war_gear.armour = { type: 'Coat of Mail', load: 12 };
    character.war_gear.helm = { load: 4 };

    const result = normaliseCharacter(character);

    expect(result.load).toBe(Math.ceil(16 / 2));
  });

  it('halves armour+helm load when blessing is the legacy English name', () => {
    const character = createEmptyCharacter('DWARVES_OF_DURINS_FOLK');
    character.cultural_blessing = 'Redoubtable';
    character.war_gear.armour = { type: 'Coat of Mail', load: 12 };

    const result = normaliseCharacter(character);

    expect(result.load).toBe(Math.ceil(12 / 2));
  });

  it('does not halve load for non-Dwarven blessings', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.cultural_blessing = 'hobbit-sense';
    character.war_gear.armour = { type: 'Leather Shirt', load: 3 };

    const result = normaliseCharacter(character);

    expect(result.load).toBe(3);
  });
});

describe('virtue effects via id and legacy name', () => {
  it('grants +1 max hope from the Untameable-Spirit cultural virtue', () => {
    const character = createEmptyCharacter('DWARVES_OF_DURINS_FOLK');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.attributes.wits = 5;
    character.virtues = [{ id: 'untameable-spirit', name: 'Untameable Spirit', origin: 'CULTURAL' }];

    const result = normaliseCharacter(character);

    expect(result.max_hope).toBe(5 + 8 + 1);
  });

  it('resolves Hardiness by legacy name into +2 max endurance', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.attributes.wits = 5;
    character.virtues = [{ name: 'Hardiness', origin: 'STARTING' }];

    const result = normaliseCharacter(character);

    expect(result.max_endurance).toBe(4 + 18 + 2);
  });

  it('stacks repeatable Hardiness virtues', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.virtues = [
      { id: 'hardiness', name: 'Hardiness', origin: 'STARTING' },
      { id: 'hardiness', name: 'Hardiness', origin: 'STANDARD' },
    ];

    const result = normaliseCharacter(character);

    expect(result.max_endurance).toBe(4 + 18 + 4);
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
