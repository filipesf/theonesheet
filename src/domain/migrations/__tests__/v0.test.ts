import { describe, expect, it } from 'vitest';
import type { VirtueId } from '../../../ref-data/virtues';
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

describe('migrateV0ToV0 — fellowship focus', () => {
  it('promotes the legacy singleton fellowship_focus_id to a 1-element array', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE') as ReturnType<typeof createEmptyCharacter> & {
      fellowship_focus_id?: string | null;
    };
    character.fellowship_focus_id = 'companion-uuid';
    delete (character as { fellowship_focus_ids?: readonly string[] }).fellowship_focus_ids;

    const migrated = migrateV0ToV0(character);

    expect(migrated.fellowship_focus_ids).toEqual(['companion-uuid']);
  });

  it('coerces a missing legacy field to an empty array', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    delete (character as { fellowship_focus_ids?: readonly string[] }).fellowship_focus_ids;

    const migrated = migrateV0ToV0(character);

    expect(migrated.fellowship_focus_ids).toEqual([]);
  });

  it('leaves an existing canonical array untouched', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.fellowship_focus_ids = ['hero-a', 'hero-b'];

    const migrated = migrateV0ToV0(character);

    expect(migrated.fellowship_focus_ids).toEqual(['hero-a', 'hero-b']);
  });
});

describe('migrateV0ToV0 — conditions backfill', () => {
  it('defaults overwhelmed/dying/unconscious to false when missing', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.attributes.heart = 5;
    character.current_endurance = 22;
    character.current_hope = 15;
    character.conditions = { weary: false, miserable: false, wounded: false } as typeof character.conditions;

    const migrated = migrateV0ToV0(character);

    expect(migrated.conditions.overwhelmed).toBe(false);
    expect(migrated.conditions.dying).toBe(false);
    expect(migrated.conditions.unconscious).toBe(false);
  });
});

describe('migrateV0ToV0 — shadow path step', () => {
  it('initialises shadow_path_step from flaws.length', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.flaws = ['avarice', 'spite'];
    delete (character as { shadow_path_step?: number }).shadow_path_step;

    const migrated = migrateV0ToV0(character);

    expect(migrated.shadow_path_step).toBe(2);
  });
});

describe('migrateV0ToV0 — legacy patron ids', () => {
  it('clears non-canonical legacy patron ids by leaving them as raw strings', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.company_id = 'beorn';

    const migrated = migrateV0ToV0(character);

    // Beorn was removed from the canonical 6 (DOMAIN_SPEC §11.1) — the value
    // is preserved verbatim so the user can choose a new patron in the UI.
    expect(migrated.company_id).toBe('beorn');
  });

  it('maps a legacy English patron name to a canonical id', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.company_id = 'Bilbo Baggins';

    const migrated = migrateV0ToV0(character);

    expect(migrated.company_id).toBe('bilbo');
  });
});

describe('migrateV0ToV0 — deprecated cultural virtue ids', () => {
  it('rewrites pre-Phase-3 Bree virtue ids to canonical replacements', () => {
    const character = createEmptyCharacter('MEN_OF_BREE');
    // 'crafty' is a deprecated id no longer in the canonical VirtueId union,
    // but the migration must handle stored characters carrying it.
    type DeprecatedVirtueId = VirtueId | 'crafty' | 'foresight-of-their-kindred';
    character.virtues = [
      { id: 'crafty' as DeprecatedVirtueId as VirtueId, name: 'Crafty', origin: 'CULTURAL' },
    ];

    const migrated = migrateV0ToV0(character);

    expect(migrated.virtues[0]?.id).toBe('friendly-and-familiar');
  });

  it('rewrites pre-Phase-3 Rangers virtue ids to canonical replacements', () => {
    const character = createEmptyCharacter('RANGERS_OF_THE_NORTH');
    type DeprecatedVirtueId = VirtueId | 'foresight-of-their-kindred';
    character.virtues = [
      {
        id: 'foresight-of-their-kindred' as DeprecatedVirtueId as VirtueId,
        name: 'Foresight',
        origin: 'CULTURAL',
      },
    ];

    const migrated = migrateV0ToV0(character);

    expect(migrated.virtues[0]?.id).toBe('foresight-of-his-folk');
  });

  it('leaves canonical virtue ids untouched', () => {
    const character = createEmptyCharacter('MEN_OF_BREE');
    character.virtues = [{ id: 'bree-pony', name: 'Bree-Pony', origin: 'CULTURAL' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.virtues[0]?.id).toBe('bree-pony');
  });
});

describe('migrateV0ToV0 — legacy virtue-rewards promote to virtues', () => {
  it('moves a legacy Hardiness reward into the virtues array', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.attributes.strength = 4;
    character.rewards = [{ name: 'Hardiness', origin: 'STARTING' }];
    character.virtues = [];

    const migrated = migrateV0ToV0(character);

    expect(migrated.rewards).toHaveLength(0);
    expect(migrated.virtues[0]?.id).toBe('hardiness');
    // Virtue-derived bonus must come through after the move.
    expect(migrated.max_endurance).toBe(4 + 18 + 2);
  });

  it('does not duplicate the virtue when the character already has it', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Hardiness', origin: 'STARTING' }];
    character.virtues = [{ id: 'hardiness', name: 'Hardiness', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.virtues.filter((v) => v.id === 'hardiness')).toHaveLength(1);
    expect(migrated.rewards).toHaveLength(0);
  });

  it('keeps non-legacy rewards (e.g. Keen) in the rewards array', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Keen', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.rewards[0]?.id).toBe('keen');
  });
});

describe('migrateV0ToV0 — reward backfill', () => {
  it('backfills reward ids from Standard Reward names', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Reinforced', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.rewards[0]?.id).toBe('reinforced');
  });

  it('promotes legacy virtue-shaped reward names (Hardiness/Confidence/Nimbleness) to virtues', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Hardiness', origin: 'STARTING' }];
    character.virtues = [];

    const migrated = migrateV0ToV0(character);

    // Phase 0.3 corrected the canon: these names are Virtues, not Rewards.
    expect(migrated.rewards).toHaveLength(0);
    expect(migrated.virtues[0]?.id).toBe('hardiness');
  });

  it('leaves unrecognised reward names without an id', () => {
    const character = createEmptyCharacter('HOBBITS_OF_THE_SHIRE');
    character.rewards = [{ name: 'Custom Reward', origin: 'STARTING' }];

    const migrated = migrateV0ToV0(character);

    expect(migrated.rewards[0]?.id).toBeUndefined();
  });
});
