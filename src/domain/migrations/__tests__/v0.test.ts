import { describe, expect, it } from 'vitest';
import { createEmptyCharacter } from '../../schema';
import { migrateV0ToV0 } from '../v0';

describe('migrateV0ToV0 — shadow path backfill', () => {
  it('maps a known legacy English name to its kebab-case id', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.shadow_path = 'Dragon-Sickness';

    const migrated = migrateV0ToV0(character);

    expect(migrated.shadow_path).toBe('dragon-sickness');
  });

  it('leaves an unrecognised string untouched', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.shadow_path = 'A Custom Path';

    const migrated = migrateV0ToV0(character);

    expect(migrated.shadow_path).toBe('A Custom Path');
  });

  it('passes through an empty shadow path', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.shadow_path = '';

    const migrated = migrateV0ToV0(character);

    expect(migrated.shadow_path).toBe('');
  });
});

describe('migrateV0ToV0 — war-gear backfill', () => {
  it('backfills weapon ids from legacy English type strings without rewriting load', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.war_gear.weapons = [
      { type: 'Sword', load: 2 },
      { type: 'Bow', load: 2 },
    ];

    const migrated = migrateV0ToV0(character);

    expect(migrated.war_gear.weapons[0]?.id).toBe('sword');
    expect(migrated.war_gear.weapons[0]?.load).toBe(2);
    expect(migrated.war_gear.weapons[1]?.id).toBe('bow');
  });

  it('backfills armour and shield ids', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.war_gear.armour = { type: 'Leather Shirt', load: 3 };
    character.war_gear.shield = { type: 'Shield', load: 4, parry_bonus: 2, destroyed: false };

    const migrated = migrateV0ToV0(character);

    expect(migrated.war_gear.armour?.id).toBe('leather-shirt');
    expect(migrated.war_gear.shield?.id).toBe('shield');
  });

  it('leaves unrecognised gear strings without an id', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.war_gear.weapons = [{ type: 'Custom Blade', load: 1 }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.war_gear.weapons[0]?.id).toBeUndefined();
    expect(migrated.war_gear.weapons[0]?.type).toBe('Custom Blade');
  });
});

describe('migrateV0ToV0 — virtue backfill', () => {
  it('backfills the canonical id from a legacy English virtue name', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.virtues = [{ name: 'Hardiness', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.virtues[0]?.id).toBe('hardiness');
  });

  it('leaves unrecognised virtue names without an id', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.virtues = [{ name: 'Custom Virtue', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.virtues[0]?.id).toBeUndefined();
  });
});

describe('migrateV0ToV0 — distinctive features backfill', () => {
  it('maps legacy English distinctive features to canonical kebab ids', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.distinctive_features = ['Keen-Eyed', 'Inquisitive', 'Burglary'];

    const migrated = migrateV0ToV0(character);

    expect(migrated.distinctive_features).toEqual(['keen-eyed', 'inquisitive', 'burglary']);
  });

  it('passes unrecognised distinctive features through untouched', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.distinctive_features = ['Custom Trait'];

    const migrated = migrateV0ToV0(character);

    expect(migrated.distinctive_features).toEqual(['Custom Trait']);
  });
});

describe('migrateV0ToV0 — blessing backfill', () => {
  it('maps the legacy English blessing to a kebab id', () => {
    const character = createEmptyCharacter('DWARVES_OF_DURINS_FOLK');
    character.cultural_blessing = 'Redoubtable';

    const migrated = migrateV0ToV0(character);

    expect(migrated.cultural_blessing).toBe('redoubtable');
  });

  it('leaves an empty blessing string untouched', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.cultural_blessing = '';

    const migrated = migrateV0ToV0(character);

    expect(migrated.cultural_blessing).toBe('');
  });
});

describe('migrateV0ToV0 — skill backfill', () => {
  it('backfills skill ids from legacy English names', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.skills = character.skills.map((skill) => ({
      name: skill.name,
      category: skill.category,
      rating: skill.rating,
      favoured: skill.favoured,
    }));

    const migrated = migrateV0ToV0(character);

    const stealth = migrated.skills.find((s) => s.name === 'Stealth');
    expect(stealth?.id).toBe('stealth');
    const lore = migrated.skills.find((s) => s.name === 'Lore');
    expect(lore?.id).toBe('lore');
  });

  it('passes through unrecognised skill names', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.skills = [
      { name: 'Custom Skill', category: 'STRENGTH', rating: 0, favoured: false },
    ];

    const migrated = migrateV0ToV0(character);

    expect(migrated.skills[0]?.id).toBeUndefined();
  });
});

describe('migrateV0ToV0 — reward backfill', () => {
  it('backfills reward ids from Standard Reward names', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Reinforced', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.rewards[0]?.id).toBe('reinforced');
  });

  it('backfills the legacy virtue-shaped reward names (Hardiness/Confidence/Nimbleness)', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Hardiness', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.rewards[0]?.id).toBe('hardiness');
  });

  it('leaves unrecognised reward names without an id', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Custom Reward', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.rewards[0]?.id).toBeUndefined();
  });
});
