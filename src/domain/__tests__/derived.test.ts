import { describe, expect, it } from 'vitest';
import { computeMaxFellowship } from '../derived';
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

describe('Fatigue contributes to total Load', () => {
  it('adds fatigue points directly to load alongside gear', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.attributes.wits = 5;
    character.fatigue = 3;
    character.war_gear.armour = { type: 'Leather Shirt', load: 3 };

    const result = normaliseCharacter(character);

    expect(result.load).toBe(3 + 3);
  });

  it('counts fatigue when no gear is equipped', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.fatigue = 2;

    const result = normaliseCharacter(character);

    expect(result.load).toBe(2);
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

describe('Kings of Men attribute-plus blessing', () => {
  it('adds 1 to the chosen attribute before TN derivation', () => {
    const character = createEmptyCharacter('RANGERS_OF_THE_NORTH');
    character.cultural_blessing = 'kings-of-men';
    character.cultural_blessing_choice = { kind: 'attribute-plus', attribute: 'wits' };
    character.attributes.strength = 5;
    character.attributes.heart = 5;
    character.attributes.wits = 4;

    const result = normaliseCharacter(character);

    expect(result.attributes.wits).toBe(5);
    expect(result.attributes.tn_wits).toBe(15);
    // Rangers parry formula = WITS + 14 → uses bumped WITS
    expect(result.base_parry).toBe(5 + 14);
  });

  it('does nothing when the choice is not provided', () => {
    const character = createEmptyCharacter('RANGERS_OF_THE_NORTH');
    character.cultural_blessing = 'kings-of-men';
    character.attributes.strength = 5;
    character.attributes.heart = 5;
    character.attributes.wits = 4;

    const result = normaliseCharacter(character);

    expect(result.attributes.wits).toBe(4);
    expect(result.attributes.tn_wits).toBe(16);
  });
});

describe('Prowess virtue selection', () => {
  it('reduces the chosen attribute TN by 1', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.attributes.wits = 5;
    character.virtues = [
      {
        id: 'prowess',
        name: 'Prowess',
        origin: 'STARTING',
        selection: { kind: 'prowess', attribute: 'wits' },
      },
    ];

    const result = normaliseCharacter(character);

    expect(result.attributes.tn_wits).toBe(20 - 5 - 1);
    expect(result.attributes.tn_strength).toBe(20 - 4);
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

describe('Standard of Living advancement', () => {
  it('rises automatically when treasure crosses the next-tier threshold', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.standard_of_living = 'COMMON';
    character.treasure = 90;

    const result = normaliseCharacter(character);

    expect(result.standard_of_living).toBe('PROSPEROUS');
  });

  it('skips multiple tiers when treasure spans them', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.standard_of_living = 'FRUGAL';
    character.treasure = 200;

    const result = normaliseCharacter(character);

    // 200 ≥ 30 (Common) ≥ 90 (Prosperous) ≥ 180 (Rich) but < 300 (Very Rich).
    expect(result.standard_of_living).toBe('RICH');
  });

  it('does not drop when treasure falls below the current tier', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.standard_of_living = 'PROSPEROUS';
    character.treasure = 0;

    const result = normaliseCharacter(character);

    expect(result.standard_of_living).toBe('PROSPEROUS');
  });

  it('caps at VERY_RICH', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.standard_of_living = 'RICH';
    character.treasure = 1_000;

    const result = normaliseCharacter(character);

    expect(result.standard_of_living).toBe('VERY_RICH');
  });
});

describe('Shadow path step (flaws → step)', () => {
  it('counts the number of flaws on the path', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.flaws = ['avarice', 'greed'];

    const result = normaliseCharacter(character);

    expect(result.shadow_path_step).toBe(2);
  });

  it('caps at 4 (Fallen)', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.flaws = ['a', 'b', 'c', 'd', 'e'];

    const result = normaliseCharacter(character);

    expect(result.shadow_path_step).toBe(4);
  });
});

describe('Derived condition flags', () => {
  it('marks overwhelmed when shadow ≥ max_hope', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.heart = 5;
    character.shadow = 15;

    const result = normaliseCharacter(character);

    expect(result.conditions.overwhelmed).toBe(true);
  });

  it('does not mark overwhelmed when max_hope is 0 (not yet derived)', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.shadow = 0;

    const result = normaliseCharacter(character);

    expect(result.conditions.overwhelmed).toBe(false);
  });

  it('marks dying when wounded and at zero endurance', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.conditions.wounded = true;
    character.current_endurance = 0;

    const result = normaliseCharacter(character);

    expect(result.conditions.dying).toBe(true);
    expect(result.conditions.unconscious).toBe(false);
  });

  it('marks unconscious when at zero endurance without wounding', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.current_endurance = 0;

    const result = normaliseCharacter(character);

    expect(result.conditions.unconscious).toBe(true);
    expect(result.conditions.dying).toBe(false);
  });
});

describe('computeMaxFellowship', () => {
  it('matches DOMAIN_SPEC §4.7 for a 4-hero company with Bree-Blood and Three is Company under Bilbo', () => {
    const heroHobbit = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    heroHobbit.virtues = [{ id: 'three-is-company', name: 'Three is Company', origin: 'CULTURAL' }];
    const heroBreeA = createEmptyCharacter('MEN_OF_BREE');
    heroBreeA.cultural_blessing = 'bree-blood';
    const heroBreeB = createEmptyCharacter('MEN_OF_BREE');
    heroBreeB.cultural_blessing = 'bree-blood';
    const heroDwarf = createEmptyCharacter('DWARVES_OF_DURINS_FOLK');

    const total = computeMaxFellowship({
      members: [heroHobbit, heroBreeA, heroBreeB, heroDwarf],
      patronId: 'bilbo',
    });

    // 4 heroes + 1 (Three is Company, fixed) + 2 (Bree-Blood × 2) + 2 (Bilbo)
    expect(total).toBe(9);
  });

  it('counts Three is Company exactly once even with multiple hobbits taking the virtue', () => {
    const hobbitA = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    hobbitA.virtues = [{ id: 'three-is-company', name: 'Three is Company', origin: 'CULTURAL' }];
    const hobbitB = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    hobbitB.virtues = [{ id: 'three-is-company', name: 'Three is Company', origin: 'CULTURAL' }];

    const total = computeMaxFellowship({ members: [hobbitA, hobbitB], patronId: null });

    expect(total).toBe(2 + 1);
  });

  it('treats unknown patron ids as 0 bonus', () => {
    const hero = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    expect(computeMaxFellowship({ members: [hero], patronId: 'unknown' })).toBe(1);
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

  it('flags age outside the cultural adventuring window as a warning', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.heart = 5;
    character.age = 12;
    character.valour = 1;
    character.wisdom = 1;

    const result = validateCharacter(normaliseCharacter(character));

    const ageIssue = result.find((issue) => issue.field === 'age');
    expect(ageIssue).toBeDefined();
    expect(ageIssue?.severity).toBe('warning');
  });

  it('rejects a Coat of Mail when Standard of Living is below Prosperous', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.standard_of_living = 'COMMON';
    character.attributes.heart = 5;
    character.attributes.strength = 4;
    character.valour = 1;
    character.wisdom = 1;
    character.war_gear.armour = { id: 'coat-of-mail', type: 'Coat of Mail', load: 12 };

    const result = validateCharacter(normaliseCharacter(character));

    expect(result.some((issue) => issue.field === 'war_gear.armour')).toBe(true);
  });

  it('rejects Great Spear / Great Bow / Great Shield for Dwarves', () => {
    const character = createEmptyCharacter('DWARVES_OF_DURINS_FOLK');
    character.attributes.strength = 5;
    character.attributes.heart = 4;
    character.attributes.wits = 5;
    character.standard_of_living = 'PROSPEROUS';
    character.valour = 1;
    character.wisdom = 1;
    character.war_gear.weapons = [{ id: 'great-bow', type: 'Great Bow', load: 4 }];
    character.war_gear.shield = { id: 'great-shield', type: 'Great Shield', load: 6, parry_bonus: 3, destroyed: false };

    const result = validateCharacter(normaliseCharacter(character));

    expect(result.some((issue) => issue.field === 'war_gear.weapons')).toBe(true);
    expect(result.some((issue) => issue.field === 'war_gear.shield')).toBe(true);
  });

  it('rejects non-Small-Folk weapons for Hobbits', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.attributes.wits = 5;
    character.valour = 1;
    character.wisdom = 1;
    character.war_gear.weapons = [{ id: 'long-sword', type: 'Long Sword', load: 3 }];

    const result = validateCharacter(normaliseCharacter(character));

    expect(result.some((issue) => issue.field === 'war_gear.weapons')).toBe(true);
  });

  it('flags shadow > max_hope', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.heart = 5;
    character.shadow = 999;
    character.valour = 1;
    character.wisdom = 1;

    const result = validateCharacter(normaliseCharacter(character));

    expect(result.some((issue) => issue.field === 'shadow')).toBe(true);
  });

  it('rejects Fellowship Focus pointing at the same hero', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.heart = 5;
    character.valour = 1;
    character.wisdom = 1;
    character.fellowship_focus_ids = [character.id];

    const result = validateCharacter(normaliseCharacter(character));

    expect(result.some((issue) => issue.field === 'fellowship_focus_ids')).toBe(true);
  });
});
