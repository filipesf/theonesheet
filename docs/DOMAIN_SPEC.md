# TOR 2e Domain Specification — The One Sheet

> Canonical domain specification for The One Sheet's character-sheet webapp. Strategic / brand context lives in [`PRODUCT.md`](../PRODUCT.md); visual contracts live in [`DESIGN.md`](../DESIGN.md). This document is the source of truth for _how the game works in code_: data model, formulas, validation, and reference tables.

**Project:** The One Sheet — a character-sheet webapp for _The One Ring_ (2nd Edition)
**Version:** 1.0
**Content language:** English (canonical terminology from Free League / Devir 2nd ed.)
**Source system:** _The One Ring — Roleplaying Game_ (2nd ed.), Core Rules
**Canonical source-of-record:** [`docs/THE_ONE_RING_BASIC_RULES.md`](./THE_ONE_RING_BASIC_RULES.md) (Devir pt-BR markdown extraction). Earlier drafts of this document referenced the Free League PDF by page number; those references have been rebound to section anchors in `THE_ONE_RING_BASIC_RULES.md`. See Appendix A for the cross-reference table.
**Purpose:** canonical domain specification for a webapp implementing character-sheet management with Player-hero ↔ Loremaster sharing.
**Scope:** data model, computation rules, creation pipeline, reference tables, validation, and runtime state.
**Out of scope:** UI/UX design, authentication, infrastructure, full Journey/Combat resolution rules (only the parts that mutate the sheet).

> **Localisation note:** the source PDF used by the player base may be the Brazilian Portuguese edition (Devir). All field names and code identifiers in this spec are English. The webapp **may** offer a `pt-BR` UI surface that maps these canonical labels to the Devir translations (see §16.4).

---

## 1. Overview

The character sheet is the central object of the webapp. It represents a Player-hero through:

- **Fixed values** — defined at creation, rarely changed.
- **Derived values** — computed from attributes and current state.
- **Mutable runtime state** — resources spent and recovered during play (current Endurance, current Hope, Shadow, Load, Fatigue, Treasure, conditions).
- **Inventory and progression** — war gear, Rewards, Virtues, Experience.
- **Company bindings** — Patron, Safe Haven, Fellowship rating, Fellowship Focus.

The webapp must:

1. Let the Player-hero fill in and edit the sheet while respecting system rules.
2. Automatically compute every derived value.
3. Validate dependencies and invariants (e.g. Load ≤ max Endurance; a Dwarf cannot equip a Great Bow).
4. Share the sheet with the Loremaster in read mode (with optional comment / change-suggestion workflow).
5. Maintain a history of state changes during a session.

> **Terminology disambiguation:** The One Ring uses two distinct words that the Devir translation collapses:
>
> - **Company** — the _group_ of Player-heroes adventuring together.
> - **Fellowship** — the numerical _rating_ representing the bond of mutual trust within the Company.
> - **Fellowship Focus** — a stronger personal bond between two Company members.
>
> The webapp **must** preserve this distinction in code: `Company` is the entity, `fellowship_rating` is the integer.

---

## 2. Glossary of Domain Terms

| Term                | Definition (concise)                                                                                                                                                                                            | Webapp type         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Heroic Culture      | The hero's people/culture (6 options). Defines Cultural Blessing, suggested Attributes, Standard of Living, base Skills, Combat Proficiencies, available Distinctive Features, languages, and Cultural Virtues. | enum                |
| Calling             | The drive that pushes the hero to adventure (6 options). Adds 2 Favoured Skills, 1 additional Distinctive Feature, 1 Shadow Path.                                                                               | enum                |
| Attribute           | STRENGTH, HEART, or WITS. The hero's three numerical base ratings.                                                                                                                                              | int                 |
| Target Number (TN)  | Default difficulty for a roll bound to an Attribute. **TN = 20 − Attribute rating.**                                                                                                                            | int (derived)       |
| Skill               | Learned ability (18 skills, grouped by Attribute). Rating 0–6.                                                                                                                                                  | int + favoured flag |
| Combat Proficiency  | Weapon category (Axes, Bows, Spears, Swords). Rating 0–6.                                                                                                                                                       | int                 |
| Distinctive Feature | Personality trait that can be invoked to make a Player-hero Inspired on a roll.                                                                                                                                 | string[]            |
| Cultural Blessing   | Passive special ability granted by the Heroic Culture.                                                                                                                                                          | string              |
| Endurance           | Physical stamina. Derived stat. Reduced by injury/exertion.                                                                                                                                                     | int (max + current) |
| Hope                | Spiritual reserve. Derived stat. Spent for bonus dice and Cultural Virtue effects.                                                                                                                              | int (max + current) |
| Parry               | Defensive TN of the hero (target of incoming attacks).                                                                                                                                                          | int (derived)       |
| Shadow              | Corruption points. When ≥ current Hope → Miserable.                                                                                                                                                             | int                 |
| Shadow Scars        | Permanent Shadow exchanged for resilience.                                                                                                                                                                      | int                 |
| Load                | Weight carried (weapons + armour + shield + treasure).                                                                                                                                                          | int (derived)       |
| Fatigue             | Temporary Load accrued during journeys.                                                                                                                                                                         | int                 |
| Standard of Living  | Socioeconomic tier (6 levels). Determines starting gear, Treasure, mount.                                                                                                                                       | enum                |
| Treasure            | Accumulated wealth. Rises → Standard of Living rises.                                                                                                                                                           | int                 |
| VALOUR              | Heroic renown (1–6). Each new rank grants 1 Reward.                                                                                                                                                             | int                 |
| WISDOM              | Self-understanding (1–6). Each new rank grants 1 Virtue.                                                                                                                                                        | int                 |
| Reward              | War-gear upgrade.                                                                                                                                                                                               | object + target ref |
| Virtue              | Special ability (Standard or Cultural).                                                                                                                                                                         | object              |
| Shadow Path         | Corruption tendency suggested by the Calling.                                                                                                                                                                   | enum                |
| Flaws               | Negative traits acquired under Shadow's pressure.                                                                                                                                                               | string[]            |
| Company             | The group of Player-heroes. Shares Patron, Safe Haven, Fellowship rating.                                                                                                                                       | shared object       |
| Patron              | Mentor of the Company (e.g. Bilbo Baggins, Gandalf).                                                                                                                                                            | enum                |
| Safe Haven          | Base of operations (e.g. Bree).                                                                                                                                                                                 | string              |
| Fellowship rating   | Pool of points shared by the Company, spent to recover Hope or trigger Patron effects. Restored at session end.                                                                                                 | int (max + current) |
| Fellowship Focus    | Another Company member to which this hero is more strongly bound.                                                                                                                                               | ref                 |
| Inspired            | Per-roll state granted by invoking a Distinctive Feature or Cultural Virtue. While Inspired, spending 1 Hope on this roll yields **2** Success Dice instead of 1.                                                | per-roll flag       |
| Favoured (roll)     | Per-roll: roll 2 Feat Dice, keep best. Triggered by Favoured Skills or special abilities.                                                                                                                       | per-roll flag       |
| Ill-favoured        | Per-roll: roll 2 Feat Dice, keep worst. If both Favoured and Ill-favoured apply on the same roll, **roll only 1 Feat Die** (BR:359).                                                                            | per-roll flag       |
| Magical Success     | Per-roll: spending 1 Hope makes the roll succeed regardless of TN. Success Dice are still rolled to determine special icons.                                                                                    | per-roll flag       |
| Miserable           | Condition: Shadow ≥ current Hope. Eye-of-Sauron icon on Feat Die → automatic failure.                                                                                                                           | bool (derived)      |
| Weary               | Condition: current Endurance ≤ Load total. Success Dice showing 1/2/3 count as zero.                                                                                                                            | bool (derived)      |
| Wounded             | Condition: suffered a Piercing Blow. Slow recovery; risk of death if active.                                                                                                                                    | bool                |
| Loremaster          | The Game Master (canonical term in The One Ring).                                                                                                                                                               | role                |
| Feat Die            | The d12 used for action resolution. Faces 1–10 are numeric. Face 11 is the Eye of Sauron. Face 12 is the Gandalf rune (✦).                                                                                      | die                 |
| Gandalf rune (✦)    | Face 12 of the Feat Die. Automatic success regardless of TN; under Favoured/Ill-favoured, takes priority over numeric faces when picking best/worst.                                                            | per-roll outcome    |
| Eye of Sauron (👁)  | Face 11 of the Feat Die. Counts as numeric **0** for non-Miserable heroes; if Miserable, the entire roll fails automatically.                                                                                   | per-roll outcome    |

---

## 3. Data Model (Canonical Schema)

The structure below is normative. Implementers may rename keys to match language conventions (camelCase, snake_case), but field semantics and types are fixed.

### 3.1. `Character` (root entity)

```
Character {
  id: UUID
  name: string
  age: int

  heroic_culture: enum [
    DWARVES_OF_DURINS_FOLK,
    BARDINGS,
    ELVES_OF_LINDON,
    HOBBITS_OF_THE_SHIRE,
    MEN_OF_BREE,
    RANGERS_OF_THE_NORTH
  ]
  cultural_blessing: string              // copied from culture, read-only
  languages: string[]                    // v0-optional; defaults from culture (e.g. ['Westron', 'Khuzdul'])
  calling: enum [
    CAPTAIN, CHAMPION, MESSENGER,
    SCHOLAR, TREASURE_HUNTER, WARDEN
  ]
  shadow_path: string                    // derived from calling, read-only
  standard_of_living: enum [POOR, FRUGAL, COMMON, PROSPEROUS, RICH, VERY_RICH]

  attributes: Attributes
  skills: Skill[18]
  combat_proficiencies: CombatProficiency[4]

  distinctive_features: string[]         // 2 from culture + 1 from calling = 3
  flaws: string[]                        // added during play

  // derived stats (see §4)
  max_endurance: int
  max_hope: int
  base_parry: int

  // mutable runtime state
  current_endurance: int
  current_hope: int
  shadow: int
  shadow_scars: int
  load: int                              // computed from gear
  fatigue: int                           // 0 outside journeys
  treasure: int

  conditions: {
    weary: bool                          // derived: current_endurance ≤ total_load
    miserable: bool                      // derived: shadow ≥ current_hope
    overwhelmed: bool                    // derived: shadow ≥ max_hope
    wounded: bool                        // explicit
    dying: bool                          // explicit; only true while wounded and triggered by 2nd Wound or Critical severity
    unconscious: bool                    // derived: current_endurance == 0 && !dying
  }

  shadow_path_step: int                  // derived: flaws.length (clamped 0..4; 4 = Fallen, exits play)

  valour: int                            // 1–6
  wisdom: int                            // 1–6

  rewards: Reward[]                      // 1 starting + 1 per VALOUR rank
  virtues: Virtue[]                      // 1 starting + 1 per WISDOM rank

  war_gear: WarGear
  travelling_gear: string[]              // free text, no Load
  useful_items: UsefulItem[]             // count by Standard of Living
  mount: Mount | null                    // type + Vigour by Standard of Living

  experience: {
    skill_points: int
    adventure_points: int
    total_skill_points_spent: int        // history, optional
    total_adventure_points_spent: int
  }

  company_id: UUID                       // FK to Company
  fellowship_focus_ids: UUID[]           // FK to other Characters; max 1, or max 2 if hobbit hero has Three is Company

  heir: Heir | null                      // see §12.6
  notes: string                          // free text
  change_log: ChangeLogEntry[]           // optional, recommended
}
```

### 3.2. `Attributes`

```
Attributes {
  strength: int                          // chosen value at creation
  heart: int
  wits: int

  // derived
  tn_strength: int                       // = 20 - strength
  tn_heart: int                          // = 20 - heart
  tn_wits: int                           // = 20 - wits
}
```

### 3.3. `Skill`

The 18 skills are fixed (see §6.4). Each carries:

```
Skill {
  name: enum (one of 18; see §6.4)
  category: enum [STRENGTH, HEART, WITS]
  rating: int (0..6)
  favoured: bool
}
```

### 3.4. `CombatProficiency`

```
CombatProficiency {
  name: enum [AXES, BOWS, SPEARS, SWORDS]
  rating: int (0..6)
}
```

### 3.5. `WarGear`

```
WarGear {
  weapons: Weapon[]
  armour: Armour | null
  helm: Helm | null
  shield: Shield | null
}

Weapon {
  type: enum (see §8.1)
  damage: int
  injury: int                            // may have two values (1h/2h)
  load: int
  proficiency: enum
  notes: string
  rewards_applied: Reward[]              // see §10.1
  protected: bool                        // derived: rewards_applied.length > 0 (UI shows lock; cannot be discarded — BR:2472)
  proper_name: string | null             // named weapon (§10.2)
}

Armour {
  type: enum [LEATHER_SHIRT, LEATHER_CORSLET, MAIL_SHIRT, COAT_OF_MAIL]
  protection: int                        // in dice (1d, 2d, 3d, 4d)
  load: int
  rewards_applied: Reward[]
  protected: bool                        // derived: rewards_applied.length > 0
}

Helm {
  protection_bonus: int                  // always +1d
  load: int                              // always 4
  rewards_applied: Reward[]
  protected: bool                        // derived: rewards_applied.length > 0
  removed_in_combat: bool                // v0-optional, transient; resets on combat exit
}

Shield {
  type: enum [BUCKLER, SHIELD, GREAT_SHIELD]
  parry_bonus: int                       // +1, +2, +3
  load: int                              // 2, 4, 6
  destroyed: bool                        // can be smashed in combat
  rewards_applied: Reward[]
  protected: bool                        // derived: rewards_applied.length > 0
}
```

> **Helm removed in combat (§4.4 amendment):** when `helm.removed_in_combat` is true, subtract `helm.load` from `total_load` for the duration of the current combat scene. The flag itself is transient (see §15 anti-patterns) and resets when combat ends.

### 3.6. `Reward` and `Virtue`

```
Reward {
  name: enum [
    CLOSE_FITTING,
    CUNNING_MAKE,
    FELL,
    GRIEVOUS,
    KEEN,
    REINFORCED,
    // ... enchanted rewards in advanced campaigns
  ]
  valid_targets: enum[]                  // gear types that accept it
  effect: string                         // mechanical description
  enchanted: bool                        // advanced rewards
}

Virtue {
  name: string
  origin: enum [STANDARD, CULTURAL, STARTING]
  culture: enum | null                   // if cultural
  effect: string
  repeatable: bool                       // e.g. Hardiness can be taken multiple times
}
```

### 3.7. `Company` (shared entity)

```
Company {
  id: UUID
  name: string
  patron: Patron
  safe_haven: string
  members: Character[]

  max_fellowship: int                    // derived (see §4.7 / §11.2)
  current_fellowship: int

  songs: Song[]                          // v1+; composed via Yule "Compose a Song" undertaking
  temporary_modifiers: TemporaryModifier[]   // v0-optional; expires at next Fellowship Phase
}

Patron {
  id: enum [BALIN, BILBO, CIRDAN, GANDALF, GILRAEN, TOM_AND_GOLDBERRY]
  name: string
  fellowship_bonus: int                  // 0..+2
  special_effect: string
  favoured_callings: enum[]
}

Song {                                   // v1+
  id: UUID
  name: string
  type: enum [BALLAD, VICTORY, WALKING]
  composed_by_character_id: UUID
  used: bool                             // single-use until next Yule
}

TemporaryModifier {                      // v0-optional
  kind: enum [
    FELLOWSHIP_BONUS,                    // e.g. Strengthen Fellowship +1
    JOURNEY_DETERMINATION_BONUS,         // e.g. Ponder Marked Maps +1
    // …extend as undertakings are added
  ]
  source: enum [
    STRENGTHEN_FELLOWSHIP,
    FIND_PATRON_BILBO,
    PONDER_MARKED_MAPS,
    // …
  ]
  value: int
  expires_at_phase_id: UUID              // cleared at the start of the next Fellowship Phase
}
```

> The `temporary_modifiers[]` array is the canonical home for ephemeral undertaking effects. They are **never** folded into `max_fellowship` (§15 anti-pattern); the UI applies them at display time and the migration sweep clears expired entries on Fellowship Phase entry.

### 3.8. `UsefulItem`, `Mount`, `Heir`, `WoundState`, `JourneyState`

```
UsefulItem {
  description: string
  associated_skill: enum
}

Mount {
  type: enum [PONY, HORSE]
  quality: string                        // depends on Standard of Living
  vigour: int (1..3)
}

Heir {                                   // v1+ scope
  name: string
  family_skill: enum                     // inherited as additional Favoured
  previous_experience_pool: int          // 0..20
  heirlooms: Heirloom[]                  // up to 1 (pool ≥15) or 2 (pool = 20)
}

Heirloom {
  kind: enum [ENCHANTED_REWARD, FAMOUS_WEAPON, WONDROUS_ARTEFACT]
  ref: UUID                              // reference into ref-data
  active_qualities: int                  // for FAMOUS_WEAPON: 1 by default; raised at Yule
}
```

> **Heir creation cost (Yule undertaking):** spend up to 5 Treasure + 5 Adventure points per session; the AP raise the `previous_experience_pool` (max 20). Heir is ready to play when `pool ≥ 10`. The heir inherits the **Standard of Living of the original hero** (not the cultural baseline). See §12.6.

```
WoundState {                             // v1; v0 keeps `conditions.wounded: bool`
  active: bool
  severity: enum [MODERATE, GRAVE, CRITICAL] | null
  recovery_days_remaining: int | null    // null for MODERATE
  first_aid_used: bool
}

JourneyState {                           // v1; separate entity, not persisted on the sheet
  id: UUID
  company_id: UUID
  start_location: string
  end_location: string
  difficulty: enum [NORMAL, BORDER, WILD, DARK]
  roles: Map<character_id, JourneyRole>  // GUIDE, HUNTER, LOOK_OUT, SCOUT
  events_resolved: JourneyEvent[]
  fatigue_at_start: Map<character_id, int>
  status: enum [IN_PROGRESS, COMPLETED, ABORTED]
}
```

> **v0 → v1 wound migration:** an existing `conditions.wounded == true` becomes `WoundState { active: true, severity: null, recovery_days_remaining: null, first_aid_used: false }`. v0 sheets are imported clean.
>
> **JourneyState is not on the sheet.** It lives as a temporary object while the Company is on a journey. The sheet only stores the resulting Fatigue and any Wounds incurred.

---

## 4. Derived Values — Formulas

All values below **must** be recomputed by the backend on every relevant change. The frontend never accepts direct writes to these fields.

### 4.1. Attribute Target Numbers (TNs)

```
tn_strength = 20 − attributes.strength
tn_heart    = 20 − attributes.heart
tn_wits     = 20 − attributes.wits
```

### 4.2. Initial derived stats (per culture)

The formula is **culture-dependent**. See §6.2.

| Culture                 | max Endurance | max Hope   | base Parry |
| ----------------------- | ------------- | ---------- | ---------- |
| Dwarves of Durin's Folk | STRENGTH + 22 | HEART + 8  | WITS + 10  |
| Bardings                | STRENGTH + 20 | HEART + 8  | WITS + 12  |
| Elves of Lindon         | STRENGTH + 20 | HEART + 8  | WITS + 12  |
| Hobbits of the Shire    | STRENGTH + 18 | HEART + 10 | WITS + 12  |
| Men of Bree             | STRENGTH + 20 | HEART + 10 | WITS + 10  |
| Rangers of the North    | STRENGTH + 20 | HEART + 6  | WITS + 14  |

> **After applying the cultural formula**, the following permanent modifiers may apply:
>
> - Virtue **Hardiness** → +2 max Endurance (repeatable).
> - Virtue **Confidence** → +2 max Hope (repeatable).
> - Virtue **Nimbleness** → +1 base Parry (repeatable).
> - Virtue **Prowess** → −1 to one Attribute TN (repeatable).
> - Cultural Blessing **Kings of Men** (Rangers) → +1 to one Attribute (recompute TNs and derived stats).
> - Dwarven Cultural Virtue **Untameable Spirit** → +1 max Hope.
> - Elven Cultural Virtue **Elbereth Gilthoniel!** → +1 max Hope.
> - Bree-folk Cultural Virtue **Bree-Pony** → +1 max Hope.

> **Starting Virtue** (chosen at creation) uses the same effect as the corresponding Standard Virtue — see §10.4. The **Starting Reward** is always tied to a gear item (see §10.3) and never modifies stats directly.

### 4.3. Effective Parry (in combat)

```
effective_parry = base_parry + (shield ? shield.parry_bonus : 0)
```

Temporary modifiers (Path of Durin, Small Folk, etc.) apply contextually — they are not persisted on the sheet.

### 4.4. Total Load

```
total_load = sum(weapon.load ∀ equipped weapon)
           + (armour ? armour.load : 0)
           + (helm ? helm.load : 0)
           + (shield ? shield.load : 0)
           + treasure_in_load
           + fatigue
```

> **Fatigue** (BR:2155–2157) is **always** added to total Load — both during journeys (where it accrues from journey events) and outside them, until cleared by rest. Fatigue is therefore a permanent component of Load whenever its value is `> 0`.
>
> **Dwarven Cultural Blessing "Redoubtable"** halves the Load of armour + helm (rounded up). Apply **before** summing.

### 4.5. Derived conditions

```
weary     = current_endurance ≤ total_load
miserable = shadow ≥ current_hope
wounded   = explicit flag; affects Endurance recovery
```

`weary` and `miserable` are purely derived — never written manually.

### 4.6. Standard of Living from Treasure

The Standard of Living rises when accumulated Treasure reaches the threshold of the next tier:

| Standard of Living | Starting Treasure | Threshold to advance     |
| ------------------ | ----------------- | ------------------------ |
| Poor               | 0                 | — (narrative event only) |
| Frugal             | 0                 | 30                       |
| Common             | 30                | 90                       |
| Prosperous         | 90                | 180                      |
| Rich               | 180               | 300+                     |
| Very Rich          | 300+              | — (campaign-end tier)    |

> **Rule:** the starting Standard of Living is set by the Heroic Culture. It rises automatically when `treasure ≥ next_tier_threshold`. It does **not** drop automatically — only via narrative event or controlled spending.

### 4.7. Fellowship rating

```
max_fellowship = number_of_player_heroes_in_company
               + (any_hobbit_hero_has_three_is_company ? 1 : 0)   // fixed +1 per Company, not per hobbit
               + (count_of_bree_folk_heroes_with_bree_blood × 1)  // +1 per Bree-folk hero
               + patron_bonus                                      // varies (0..+2)
```

> **Three is Company** is a Hobbit Cultural Virtue that adds **+1 fixed** to the Company's max Fellowship — the bonus does **not** stack across multiple hobbits taking the Virtue.
>
> **Bree-Blood** is the Men of Bree Cultural Blessing: it adds +1 per Bree-folk hero in the Company (BR:1080).

### 4.8. Age — cultural windows (validation)

| Culture     | Min adventuring age           | Typical retirement            |
| ----------- | ----------------------------- | ----------------------------- |
| Dwarves     | ~50                           | ~90                           |
| Bardings    | 18                            | ~40                           |
| Elves       | ~100                          | open-ended (sail to the West) |
| Hobbits     | 20–30 ("irresponsible years") | ~50                           |
| Men of Bree | young adult                   | ~40                           |
| Rangers     | 20 (sometimes younger)        | ~50                           |

> **Recommendation:** the webapp should validate but allow override with a warning (narrative rules are flexible).

---

## 5. Character Creation Pipeline

Creation follows **9 mandatory ordered phases**. Each phase has inputs, outputs, and validations.

> **Implementation principle:** the webapp should walk the user through these phases sequentially (wizard) and only allow advancing when the current phase is valid. Phases may be revisited before finalisation.

### Phase 1 — Choose Heroic Culture

- **Input:** selection from the 6 cultures (§6).
- **Automatic actions:**
  - Copy `cultural_blessing` to the sheet.
  - Set initial `standard_of_living`.
  - Load derived-stat formulas, languages, available Cultural Virtues.
  - Apply cultural restrictions (e.g. Dwarves cannot use Great Bow, Great Spear, or Great Shield).
- **Output:** culture recorded.

### Phase 2 — Determine Attributes

- **Input:** one of two paths:
  1. **Pick a set** from the 6 listed in the cultural table.
  2. **Roll 1 Success Die** (1–6) and use the matching set.
- **Automatic actions:** assign STRENGTH, HEART, WITS.
- **Validation:** values must match exactly one row of the cultural table.

### Phase 3 — Compute Attribute TNs

- **Automatic:** `TN = 20 − rating`. No user input.

### Phase 4 — Compute Derived Stats

- **Automatic:** max Endurance, max Hope, base Parry using cultural formulas (§4.2).
- **Initialise runtime state:** `current_endurance = max_endurance`, `current_hope = max_hope`, `shadow = 0`, `shadow_scars = 0`.

### Phase 5 — Record Skills and Combat Proficiencies (cultural baseline)

- **Automatic:** copy every value from the cultural table.
- **User input:**
  - Mark **one** Skill among the two underlined as Favoured.
  - When the culture offers a Combat Proficiency choice (e.g. "Axes OR Swords"), pick one.
  - Pick the additional Combat Proficiency ("Choose a Combat Proficiency" → +1).

### Phase 6 — Choose Distinctive Features (cultural)

- **Input:** choose **2** from the culture's list.

### Phase 7 — Choose Name and Age

- **Input:** free text. The webapp may offer cultural name lists as suggestions.
- **Validation:** age within the cultural window (§4.8) — warning only.

### Phase 8 — Answer the Calling

This phase has 4 sequential sub-steps:

#### 8a. Choose Calling (1 of 6)

- Copy `shadow_path` to the sheet.
- Add the Calling's additional Distinctive Feature.

#### 8b. Mark the Calling's Favoured Skills

- Pick **2** of the 3 Skills listed by the Calling and mark them as Favoured.
- **Validation:** if a Calling Skill is already Favoured by culture, just record (the `favoured` flag is boolean, not a counter).

#### 8c. Spend 10 Previous Experience points

- **Pool:** 10 points.
- **Skill costs:**

  | Target rating | Cost |
  | ------------- | ---- |
  | 0 → 1         | 1    |
  | 1 → 2         | 2    |
  | 2 → 3         | 3    |
  | 3 → 4         | 5    |

- **Combat Proficiency costs:**

  | Target rating | Cost |
  | ------------- | ---- |
  | 0 → 1         | 2    |
  | 1 → 2         | 4    |
  | 2 → 3         | 6    |

- **Validation:** sum of costs ≤ 10. Spending all 10 is not mandatory. May raise multiple ranks in the same skill by paying cumulatively.

#### 8d. Choose Starting Gear

- **Weapons:** one weapon per Combat Proficiency with rating ≥ 1, using §8.1. Cultural restrictions apply.
- **Armour / Helm / Shield:** Standard-of-Living-gated selection (see §8.2 — heavier armour requires higher Standard of Living).
- **Useful Items:** count per Standard of Living (§8.4).
- **Travelling Gear:** free text, no Load.

#### 8e. Set VALOUR and WISDOM to 1; choose Starting Reward and Starting Virtue

- `valour = 1`, `wisdom = 1`.
- Pick **1 Starting Reward** from the 6 listed (§10.3).
- Pick **1 Starting Virtue** from the 6 listed (§10.4) — must be a **Standard Virtue** (Cultural Virtues require WISDOM ≥ 2).

> **Starting Reward vs Starting Virtue:** the Starting Reward is always a gear upgrade (Close-Fitting, Cunning Make, Fell, Grievous, Keen, Reinforced) applied to a specific item from the starting equipment. The Starting Virtue is always a Standard Virtue (Confidence, Dour-Handed, Hardiness, Mastery, Nimbleness, Prowess) and may modify stats. The two choices are independent and made together.

### Phase 9 — Form the Company

This phase is **collaborative across all players and the Loremaster**. The webapp should represent it as a shared object:

1. Choose a **Patron** (§11.1 — 6 default options).
2. Choose a **Safe Haven** (text, default suggestion: Bree).
3. Compute **starting Fellowship rating** (§4.7).
4. Choose **Fellowship Focus** (each hero picks one other Company member — may be deferred).

---

## 6. Reference Tables — Heroic Cultures

### 6.1. Comparison Summary

| Culture                 | Cultural Blessing                                                  | Standard of Living | Base Combat Proficiency      | Restrictions                                                |
| ----------------------- | ------------------------------------------------------------------ | ------------------ | ---------------------------- | ----------------------------------------------------------- |
| Dwarves of Durin's Folk | Redoubtable (½ Load on armour + helm)                              | Prosperous         | Axes OR Swords (2) + 1 (1)   | No Great Bow, Great Spear, Great Shield                     |
| Bardings                | Stout-Hearted (VALOUR rolls Favoured)                              | Prosperous         | Bows OR Swords (2) + 1 (1)   | —                                                           |
| Elves of Lindon         | Elven-Skill (spend Hope → Magical success on Skill roll)           | Frugal             | Bows OR Spears (2) + 1 (1)   | The Long Defeat: removes only 1 Shadow per Fellowship Phase |
| Hobbits of the Shire    | Hobbit-Sense (WISDOM rolls Favoured; +1d on Shadow Tests vs Greed) | Common             | Bows OR Swords (2) + 1 (1)   | Small Folk — only Dagger, Bow, Club, Short Sword, Short Spear, Spear, Axe, Mace; no Great Shield |
| Men of Bree             | Bree-Blood (+1 Fellowship per Bree-man in Company)                 | Common             | Axes OR Spears (2) + 1 (1)   | —                                                           |
| Rangers of the North    | Kings of Men (+1 to a chosen Attribute)                            | Frugal             | Spears OR Swords (2) + 1 (1) | Fidelity of the Dúnedain — Fellowship Phase Hope recovery is ⌈HEART/2⌉ instead of HEART |

### 6.2. Attribute Sets (roll 1 Success Die or pick)

#### Dwarves of Durin's Folk

| Result | STRENGTH | HEART | WITS |
| ------ | -------- | ----- | ---- |
| 1      | 7        | 2     | 5    |
| 2      | 7        | 3     | 4    |
| 3      | 6        | 3     | 5    |
| 4      | 6        | 4     | 4    |
| 5      | 5        | 4     | 5    |
| 6      | 6        | 2     | 6    |

#### Bardings

| Result | STRENGTH | HEART | WITS |
| ------ | -------- | ----- | ---- |
| 1      | 5        | 7     | 2    |
| 2      | 4        | 7     | 3    |
| 3      | 5        | 6     | 3    |
| 4      | 4        | 6     | 4    |
| 5      | 5        | 5     | 4    |
| 6      | 6        | 6     | 2    |

#### Elves of Lindon

| Result | STRENGTH | HEART | WITS |
| ------ | -------- | ----- | ---- |
| 1      | 5        | 2     | 7    |
| 2      | 4        | 3     | 7    |
| 3      | 5        | 3     | 6    |
| 4      | 4        | 4     | 6    |
| 5      | 5        | 4     | 5    |
| 6      | 6        | 2     | 6    |

#### Hobbits of the Shire

| Result | STRENGTH | HEART | WITS |
| ------ | -------- | ----- | ---- |
| 1      | 3        | 6     | 5    |
| 2      | 3        | 7     | 4    |
| 3      | 2        | 7     | 5    |
| 4      | 4        | 6     | 4    |
| 5      | 4        | 5     | 5    |
| 6      | 2        | 6     | 6    |

#### Men of Bree

| Result | STRENGTH | HEART | WITS |
| ------ | -------- | ----- | ---- |
| 1      | 2        | 5     | 7    |
| 2      | 3        | 4     | 7    |
| 3      | 3        | 5     | 6    |
| 4      | 4        | 4     | 6    |
| 5      | 4        | 5     | 5    |
| 6      | 2        | 6     | 6    |

#### Rangers of the North

| Result | STRENGTH | HEART | WITS |
| ------ | -------- | ----- | ---- |
| 1      | 7        | 5     | 2    |
| 2      | 7        | 4     | 3    |
| 3      | 6        | 5     | 3    |
| 4      | 6        | 4     | 4    |
| 5      | 5        | 5     | 4    |
| 6      | 6        | 6     | 2    |

### 6.3. Skills by Culture (starting ratings)

The order is fixed: 18 Skills in 3 columns (STRENGTH / HEART / WITS), 6 rows. The webapp should load the matrix per culture.

#### Dwarves of Durin's Folk

```
Awe        2 | Enhearten     0 | Persuade  0
Athletics  1 | Travel        3 | Stealth   0
Awareness  0 | Insight       0 | Scan      3
Hunting    0 | Healing       0 | Explore   2
Song       1 | Courtesy      1 | Riddle    2
Craft      2 | Battle        1 | Lore      1
```

Underlined (pick 1 as Favoured): see `src/ref-data/cultural-skills.ts` (the markdown extraction in `THE_ONE_RING_BASIC_RULES.md` does not preserve underline formatting).

#### Bardings

```
Awe        1 | Enhearten     2 | Persuade  3
Athletics  1 | Travel        1 | Stealth   0
Awareness  0 | Insight       2 | Scan      1
Hunting    2 | Healing       0 | Explore   1
Song       1 | Courtesy      2 | Riddle    0
Craft      1 | Battle        2 | Lore      1
```

#### Elves of Lindon

```
Awe        2 | Enhearten     1 | Persuade  0
Athletics  2 | Travel        0 | Stealth   3
Awareness  2 | Insight       0 | Scan      0
Hunting    0 | Healing       1 | Explore   0
Song       2 | Courtesy      0 | Riddle    0
Craft      2 | Battle        0 | Lore      3
```

#### Hobbits of the Shire

```
Awe        0 | Enhearten     0 | Persuade  2
Athletics  0 | Travel        0 | Stealth   3
Awareness  2 | Insight       2 | Scan      0
Hunting    0 | Healing       1 | Explore   0
Song       2 | Courtesy      2 | Riddle    3
Craft      1 | Battle        0 | Lore      0
```

#### Men of Bree

```
Awe        0 | Enhearten     2 | Persuade  2
Athletics  1 | Travel        1 | Stealth   1
Awareness  1 | Insight       2 | Scan      1
Hunting    1 | Healing       0 | Explore   1
Song       1 | Courtesy      3 | Riddle    2
Craft      2 | Battle        0 | Lore      0
```

#### Rangers of the North

```
Awe        1 | Enhearten     0 | Persuade  0
Athletics  2 | Travel        2 | Stealth   2
Awareness  2 | Insight       0 | Scan      1
Hunting    2 | Healing       2 | Explore   2
Song       0 | Courtesy      0 | Riddle    0
Craft      0 | Battle        2 | Lore      2
```

### 6.4. The 18 Skills (canonical list)

| STRENGTH column | HEART column | WITS column |
| --------------- | ------------ | ----------- |
| Awe             | Enhearten    | Persuade    |
| Athletics       | Travel       | Stealth     |
| Awareness       | Insight      | Scan        |
| Hunting         | Healing      | Explore     |
| Song            | Courtesy     | Riddle      |
| Craft           | Battle       | Lore        |

### 6.5. Distinctive Features by Culture (pick 2)

| Culture     | Available Distinctive Features                                                       |
| ----------- | ------------------------------------------------------------------------------------ |
| Dwarves     | Cunning, Wary, Fierce, Lordly, Proud, Stern, Secretive, Wilful                       |
| Bardings    | Tall, Eager, Fair, Bold, Fierce, Generous, Proud, Stern                              |
| Elves       | Swift, Merry, Fair, Wary, Lordly, Keen-Eyed, Patient, Subtle                         |
| Hobbits     | Merry, Eager, Fair-Spoken, Faithful, Honourable, Inquisitive, Keen-Eyed, Rustic      |
| Men of Bree | Cunning, Inquisitive, Fair-Spoken, Faithful, Generous, Patient, Rustic, True-Hearted |
| Rangers     | Swift, Tall, Bold, Honourable, Stern, Secretive, True-Hearted, Subtle                |

### 6.6. Canonical list of the 24 Distinctive Features

`Bold, Cunning, Eager, Faithful, Fair, Fair-Spoken, Fierce, Generous, Honourable, Inquisitive, Keen-Eyed, Lordly, Merry, Patient, Proud, Rustic, Secretive, Stern, Subtle, Swift, Tall, True-Hearted, Wary, Wilful`

> 6 additional Distinctive Features exist, exclusive to Callings (§7).

---

## 7. Reference Tables — Callings

Each Calling provides:

- **Additional Favoured Skills:** pick 2 of 3 listed.
- **Additional Distinctive Feature:** fixed per Calling.
- **Shadow Path:** typical corruption arc.

| Calling         | Skills (pick 2)             | Additional Distinctive Feature | Shadow Path        |
| --------------- | --------------------------- | ------------------------------ | ------------------ |
| Treasure Hunter | EXPLORE, SCAN, STEALTH      | Burglary                       | Dragon-Sickness    |
| Champion        | ATHLETICS, AWE, HUNTING     | Enemy-Lore (pick type)         | Curse of Vengeance |
| Captain         | BATTLE, ENHEARTEN, PERSUADE | Leadership                     | Lure of Power      |
| Scholar         | CRAFT, LORE, RIDDLE         | Rhymes of Lore                 | Lure of Secrets    |
| Warden          | AWARENESS, HEALING, INSIGHT | Shadow-Lore                    | Path of Despair    |
| Messenger       | COURTESY, SONG, TRAVEL      | Folk-Lore                      | Wandering-Madness  |

> **Enemy-Lore (Champion):** the player must pick one type from `[Evil Men, Orcs, Spiders, Trolls, Wargs, Undead]`. Store as nominal string.

---

## 8. Reference Tables — War Gear

### 8.1. Weapons

| Weapon          | Damage | Injury            | Load | Combat Proficiency | Notes                                                |
| --------------- | ------ | ----------------- | ---- | ------------------ | ---------------------------------------------------- |
| Unarmed         | 1      | —                 | 0    | Brawling\*         | Includes throwing stones; cannot cause Piercing Blow |
| Dagger          | 2      | 14                | 0    | Brawling\*         | —                                                    |
| Cudgel          | 3      | 12                | 0    | Brawling\*         | —                                                    |
| Club            | 4      | 14                | 1    | Brawling\*         | —                                                    |
| Short Sword     | 3      | 16                | 1    | Swords             | —                                                    |
| Sword           | 4      | 16                | 2    | Swords             | —                                                    |
| Long Sword      | 5      | 16 (1h) / 18 (2h) | 3    | Swords             | 1- or 2-handed                                       |
| Short Spear     | 3      | 14                | 2    | Spears             | Can be thrown                                        |
| Spear           | 4      | 14 (1h) / 16 (2h) | 3    | Spears             | 1- or 2-handed; can be thrown                        |
| Great Spear     | 5      | 16                | 4    | Spears             | 2-handed                                             |
| Axe             | 5      | 18                | 2    | Axes               | —                                                    |
| Long-hafted Axe | 6      | 18 (1h) / 20 (2h) | 3    | Axes               | 1- or 2-handed                                       |
| Great Axe       | 7      | 20                | 4    | Axes               | 2-handed                                             |
| Mattock         | 7      | 18                | 3    | Axes               | 2-handed                                             |
| Bow             | 3      | 14                | 2    | Bows               | Ranged                                               |
| Great Bow       | 4      | 16                | 4    | Bows               | Ranged                                               |

`*` Brawling: roll a number of dice equal to the highest Combat Proficiency, but the roll loses (1d).

### 8.2. Armour

| Armour          | Protection | Load | Type     | Restriction                                     |
| --------------- | ---------- | ---- | -------- | ----------------------------------------------- |
| Leather Shirt   | 1d         | 3    | Leather  | —                                               |
| Leather Corslet | 2d         | 6    | Leather  | —                                               |
| Mail-shirt      | 3d         | 9    | Mail     | Standard of Living ≥ Common (basic-rules §"ARMADURA E ESCUDOS" ~linha 2363)     |
| Coat of Mail    | 4d         | 12   | Mail     | Standard of Living ≥ Prosperous (basic-rules §"ARMADURA E ESCUDOS" ~linha 2363) |
| Helm            | +1d        | 4    | Headgear | —                                               |

> Helm may be removed in combat to lower Load.

### 8.3. Shields

| Shield       | Parry Modifier | Load | Restriction                     |
| ------------ | -------------- | ---- | ------------------------------- |
| Buckler      | +1             | 2    | —                               |
| Shield       | +2             | 4    | Standard of Living ≥ Common     |
| Great Shield | +3             | 6    | Standard of Living ≥ Prosperous |

> Shields can be smashed in combat (Combat rules — out of scope).

### 8.4. Useful Items (starting count by Standard of Living)

| Standard of Living | Typical culture      | Useful Items |
| ------------------ | -------------------- | ------------ |
| Poor               | —                    | 0            |
| Frugal             | Elves, Rangers       | 1            |
| Common             | Hobbits, Men of Bree | 2            |
| Prosperous         | Bardings, Dwarves    | 3            |
| Rich or Very Rich  | —                    | 4            |

Each Useful Item grants (1d) on a Skill roll associated with it, outside combat, at the Loremaster's discretion.

### 8.5. Ponies and Horses (mount by Standard of Living)

| Standard of Living | Mount type/quality             | Vigour |
| ------------------ | ------------------------------ | ------ |
| Poor or Frugal     | No mount                       | —      |
| Common             | Old horse or half-starved pony | 1      |
| Prosperous         | Decent creature                | 2      |
| Rich or Very Rich  | Fine creature                  | 3      |

Each pack animal can carry up to **10 Load points** of Treasure.

### 8.6. Standards of Living — starting Treasure

| Standard of Living | Starting Treasure        |
| ------------------ | ------------------------ |
| Poor               | 0                        |
| Frugal             | 0                        |
| Common             | 30                       |
| Prosperous         | 90                       |
| Rich               | 180                      |
| Very Rich          | (advanced campaign tier) |

---

## 9. Conditions, States, and Resources

### 9.1. Endurance

- **Reduced by:** combat (blows), strenuous tasks, exertion.
- **Recovered by:**
  - **Short Rest** (~1h, max 1×/day): recover STRENGTH points. Wounded heroes recover nothing.
  - **Prolonged Rest** (1×/day, sleeping): recover everything. If Wounded, recover only STRENGTH points.
- **Floor:** 0 (never negative).
- **Weary trigger:** `current_endurance ≤ load`.

### 9.2. Hope

- **Spent for:**
  - Bonus (1d) on a roll — `Inspired(1d)`.
  - Bonus (2d) if already Inspired by a Distinctive Feature — `Inspired(2d)`.
  - Activate Cultural Virtues that cost Hope.
- **Recovered by:**
  - **Spend Fellowship** during Adventuring Phase (1 Fellowship → 1 Hope distributed).
  - **Fellowship Phase**: recover HEART points (Rangers: half, rounded up).
  - **Prolonged Rest with Hope = 0:** recover 1 point.
- **Floor:** 0 (cannot spend at 0).
- **Miserable trigger:** `shadow ≥ current_hope`.

### 9.3. Shadow

Shadow is the corruption track. It accumulates from external sources, can be cleared during rest, and triggers two derived conditions: **Miserable** (`shadow ≥ current_hope`) and **Overwhelmed** (`shadow ≥ max_hope`).

#### Cap

- **Hard cap:** `shadow ≤ max_hope`. Points received above the cap are **discarded** (clamp on receive — never block the gain).

#### Sources (4 canonical categories — BR:4325–4475)

| Source        | pt-BR        | Test attribute | Shadow Test? |
| ------------- | ------------ | -------------- | ------------ |
| **Dread**     | Pavor        | VALOUR         | yes          |
| **Greed**     | Ganância     | WISDOM         | yes          |
| **Sorcery**   | Feitiçaria   | WISDOM         | yes          |
| **Misdeeds**  | Transgressões | —              | no — points apply directly |

Additional flat-rate gains (no test): **Fellowship Focus is Wounded / suffers madness** → 1 Shadow point.

#### Shadow Test mechanic

Roll 1 Feat Die + (VALOUR or WISDOM) Success Dice against the assigned TN. On success, **reduce points received by 1, plus 1 per Tengwar (✦)** rolled. Failure leaves the full amount. The Eye of Sauron face on a Shadow Test causes automatic failure if the hero is already Miserable.

#### Removed by

- **Fellowship Phase — Spiritual Recovery:** removes up to 2 points (Elves: max 1, due to "The Long Defeat").
- **Steadfast Will (Firmar Vontade):** only when `shadow < max_hope`. Convert **all** current Shadow into 1 Shadow Scar. Scars are permanent; counted as Shadow points for Miserable / Overwhelmed triggers; removable only via the Yule undertaking "Heal Scars".

#### Overwhelmed state (derived)

```
overwhelmed = shadow ≥ max_hope
```

While Overwhelmed, **every roll** the hero makes is Ill-favoured until `shadow < max_hope` again. This is distinct from **Miserable** (`shadow ≥ current_hope`), which only triggers automatic failure on Eye-of-Sauron results.

#### Madness Attack (BR:4451–4474)

A hero who is Overwhelmed may suffer (or voluntarily trigger) a **Madness Attack** to escape the state:

1. Reset `shadow = 0` and clear Overwhelmed.
2. Add the **next Flaw on the Calling's Shadow Path** to the hero's `flaws[]`.
3. The Madness Attack must occur within the current Adventuring Phase. Otherwise, the hero leaves the Company permanently.
4. After the 4th Flaw on the Path, the hero is **Fallen** (`shadow_path_step = 4`) and exits play.

### 9.4. Load and Fatigue

- **Load:** fixed sum of equipment (§4.4).
- **Fatigue:** accrued during journeys; temporarily added to Load.
- **Dwarven Blessing:** halves Load of armour + helm (not shields).

### 9.5. Wounded

- **Source:** suffering a Piercing Blow.
- **Effect:** at risk of death if remaining active; slow Endurance recovery.
- **Removed by:** Healing care + Prolonged Rest in a safe place (detailed Combat rules out of scope).

#### Severity (rolled on a Feat Die immediately after the first Wound) — BR:3232–3268

| Feat Die result    | Severity     | Effect                                                                                                              |
| ------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| Gandalf rune (✦)   | **Moderate** | No persistent effect. Recovers fully within hours after combat ends; clear the Wounded mark.                        |
| Numeric 1–10       | **Grave**    | Wound persists for that many days (record the value).                                                               |
| Eye of Sauron (👁) | **Critical** | Endurance drops to 0; the hero is **Dying** (as if Wounded twice).                                                  |

#### Dying (sub-state)

A hero is Dying if Wounded twice in succession, or on a Critical severity roll. Within ~1h of becoming Dying:

- A successful **HEALING** roll restores consciousness with **1 Endurance**. Failure → death.
- A hero saved from Dying gains a permanent narrative scar (limp, missing finger, etc.) and adds **+10 days** to the recovery time of the underlying Wound.

#### Second Wound

Suffering a Wound while already Wounded → immediate Endurance 0 + Dying.

#### First Aid

A successful **HEALING** roll reduces severity by **1 day, plus 1 day per Tengwar icon** rolled (minimum 1 day). One First Aid attempt per Wound; on failure, no retry until 1 day has passed.

> **v0 schema note:** the v0 sheet keeps a single `wounded: bool` for simplicity. The optional `wound_severity`, `dying`, and `recovery_days` fields land in Phase 2 / v1 (see refinement plan §2.10).

### 9.6. Inspired / Favoured / Ill-Favoured / Magical Success

| State           | Mechanic                                                                                            | Persistence |
| --------------- | --------------------------------------------------------------------------------------------------- | ----------- |
| Favoured        | Roll 2 Feat Dice, keep best                                                                         | Per roll    |
| Ill-favoured    | Roll 2 Feat Dice, keep worst                                                                        | Per roll    |
| Inspired        | State granted by Distinctive Feature or Cultural Virtue. While Inspired, spending 1 Hope on this roll yields **2** Success Dice (otherwise 1) | Per roll    |
| Magical Success | Spend 1 Hope to make the roll succeed regardless of TN. Success Dice still rolled to determine special icons | Per roll    |

> If both Favoured and Ill-favoured apply on the same roll, **roll only 1 Feat Die** (BR:359). These states are **transient** — they do not persist on the sheet. The webapp may offer a "Roll dice" modal that applies the modifiers.

#### Feat Die mechanics

- **Gandalf rune (✦, face 12)** — automatic success regardless of TN; under Favoured / Ill-favoured, the rune takes priority over numeric faces when picking best/worst.
- **Eye of Sauron (👁, face 11)** — counts as numeric **0** for non-Miserable heroes. If the hero is **Miserable**, an Eye result causes automatic failure regardless of Success Dice.

#### Weary effect on Success Dice

- Success Dice (d6) showing numeric face **1, 2, or 3** contribute **0** while Weary.
- The Tengwar (✦) on face 6 is **unaffected by Weary** — it still scores its full value and counts as a special icon.

---

## 10. Rewards, Virtues, and Advanced Gear

### 10.1. Rewards (canonical list — VALOUR)

Each Reward modifies **a single piece of war gear**. Cannot be applied twice to the same item.

| Reward        | Valid target         | Effect                                   |
| ------------- | -------------------- | ---------------------------------------- |
| Close-fitting | armour, helm         | +2 to PROTECTION roll result             |
| Cunning Make  | armour, helm, shield | Reduce Load by 2 (min. 0)                |
| Fell          | weapon               | +2 to Injury rating                      |
| Grievous      | weapon               | +1 to Damage rating                      |
| Keen          | weapon               | Piercing Blow on a Feat Die result of 9+ |
| Reinforced    | shield               | +1 to Parry bonus                        |

> **Enchanted Rewards** (Ancient Close Fitting, Superior Fell, etc.) exist for Famous Weapons / Wondrous Artefacts — out of scope for character creation. See basic-rules §"RECOMPENSAS ENCANTADAS" (linhas 5658+).

### 10.2. Named Weapons

Cultural naming conventions:

- **Elves / Men of Dúnedain lineage:** heroic titles ("Orc-cleaver", "Foe-hammer"). Loftier names ("Snow Point", "Cold Star") indicate ancient lineage.
- **Bardings:** sometimes name children after war gear (e.g. "Bard" can be translated as "Battle-axe").
- **Hobbits / Bree-landers:** rarely name weapons; when they do, names are simple.
- **Dwarves:** do not openly name weapons; renowned arms are known by their legendary owners (e.g. Axe of Durin).

> `proper_name` field on `Weapon` — optional, free text.

### 10.3. Starting Rewards (pick 1 at creation)

The Starting Reward is always a gear upgrade applied to a single item from the starting equipment. The 6 options match §10.1.

| Starting Reward | Valid target                | Effect                |
| --------------- | --------------------------- | --------------------- |
| Close-fitting   | armour or helm              | +2 to PROTECTION roll |
| Cunning Make    | armour, helm, shield        | −2 Load               |
| Fell            | weapon                      | +2 to Injury          |
| Grievous        | weapon                      | +1 to Damage          |
| Keen            | weapon                      | Piercing Blow on 9+   |
| Reinforced      | shield                      | +1 to Parry bonus     |

### 10.4. Starting Virtues (pick 1 at creation)

| Starting Virtue | Effect                               |
| --------------- | ------------------------------------ |
| Confidence      | +2 max Hope                          |
| Dour-Handed     | +1 damage on Heavy Blow              |
| Hardiness       | +2 max Endurance                     |
| Mastery         | Pick 2 Skills and mark them Favoured |
| Nimbleness      | +1 Parry                             |
| Prowess         | −1 to one Attribute TN               |

### 10.5. Standard Virtues (full list — for progression)

The same 6 Virtues are available for every WISDOM rank-up. Each can be taken multiple times unless stated otherwise.

| Virtue      | Effect                                                            | Repeatable |
| ----------- | ----------------------------------------------------------------- | ---------- |
| Confidence  | +2 max Hope                                                       | yes        |
| Dour-Handed | +1 STRENGTH on Heavy Blow; +1 Feat Die numerical result on Pierce | yes        |
| Hardiness   | +2 max Endurance                                                  | yes        |
| Mastery     | Pick 2 Skills → Favoured                                          | yes        |
| Nimbleness  | +1 Parry                                                          | yes        |
| Prowess     | −1 to one Attribute TN                                            | yes        |

> The full canonical Virtue effect is in basic-rules §"LISTA DE VIRTUDES" (linhas 2504–2542). There is no "simplified Starting effect" in the source — Starting Virtues use the same effect text as Standard Virtues.

### 10.6. Cultural Virtues (require WISDOM ≥ 2)

Each culture has **6 exclusive Cultural Virtues**. Summary:

#### Dwarves

- **Baruk Khazâd!** — 1×/combat in Forward Stance: Favoured attack + Intimidate Foe as secondary action.
- **Path of Durin** — +2 Parry when fighting underground / in cramped spaces.
- **Stiff-Necked** — All PROTECTION rolls Favoured (if not Miserable).
- **That Which Was Lost** — Inspired on all rolls when in the dark.
- **Untameable Spirit** — +1 max Hope; (1d) on Shadow Tests vs Sorcery.
- **Words of Power** — Mark 1 Skill per category; spend 1 Hope → Magical success.

#### Bardings

- **Cram** — −1 Fatigue per Journey Event; Short Rest restores +WISDOM Endurance to Company.
- **Dragon-Slayer** — All attack rolls Favoured vs Might-2+ creatures.
- **Dwarf-Friend** — Fellowship Focus is a Dwarf: free Protect Companion in Defensive Stance; Dwarves always Friendly.
- **Fierce Shot** — Piercing Blow on ranged: target's PROTECTION roll Ill-favoured.
- **High Destiny** — First time you'd take a deadly Wound: saved, +2 max Hope (1× per character).
- **The Language of Birds** — Communicate with birds via COURTESY/PERSUADE/SONG; +1 free Inspired roll per Combat/Council/Journey.

#### Elves

- **Against the Unseen** — Shadow Tests vs Dread Favoured; (1d) vs evil spirits.
- **Deadly Archery** — Bow + Rearward Stance: free Prepare Shot as secondary action.
- **Elbereth Gilthoniel!** — +1 max Hope; +WISDOM free Inspired rolls per Adventuring Phase.
- **Elvish Dreams** — No need to sleep; Short Rest = Prolonged Rest.
- **Gleam of Wrath** — Successful attack: enemy loses 1 Hate/Resolve, +1 per Success icon.
- **Memory of Ancient Days** — Journey Events rolled as if in a Border Land (2 Feat Dice, keep best).

#### Hobbits

- **Art of Disappearing** — Successful STEALTH in marginal cover: simply disappear.
- **Brave at a Pinch** — Inspired on all rolls when Miserable, Weary, or Wounded.
- **Small Folk** — +2 Parry vs larger foes; Rearward Stance allowed with only 1 ally in close combat.
- **Sure at the Mark** — All ranged attacks Favoured; thrown stone → Piercing Blow on ◆, Injury 12.
- **Three is Company** — +1 Fellowship rating; pick 2 Fellowship Focuses.
- **Tough as Old Tree-Roots** — Wounded: roll 2 Feat Dice (keep best); double STRENGTH on rest recovery.

#### Men of Bree

- **Bree-Pony** — +1 max Hope; pony Vigour 4.
- **Defiance** — End of each Combat (if not Wounded/Miserable): recover Endurance equal to HEART or VALOUR (higher).
- **Desperate Courage** — Spending Hope on a roll: may also gain 1 Shadow to be Inspired on that roll.
- **Friendly and Familiar** — +1 to the maximum number of Skill checks you may attempt during a council; folk encountered always begin Friendly toward you.
- **Pipe-Smoking** — Whenever you recover Hope, recover 1 extra Hope.
- **Strange as News from Bree** — In Fellowship Phase: INSIGHT or RIDDLE roll → receive a rumour.

#### Rangers of the North

- **Foresight of His Folk** — +WISDOM uses per Adventuring Phase: re-roll all dice on any roll.
- **Heir of Arnor** — Create a Wondrous Artefact / Famous Weapon with 1 Enchanted Reward (passable to heir).
- **Ranger's Resilience** — If wearing leather armour or none, and no shield, gain no Fatigue from journey events.
- **Royalty Revealed** — 1×/combat in Open Stance: free Rally Comrades; Company Inspired next round.
- **Strider** — In EXPLORE/HUNTING/TRAVEL: spend 1 Hope → Magical success; can cover multiple journey roles.
- **Strong-willed** — (1d) on Shadow Tests vs Dread.

> The effect descriptions above are summarised. Implementers must seed full mechanical text from basic-rules §"VIRTUDES CULTURAIS" (linhas 2544–2873).

---

## 11. Company, Patrons, and Fellowship

### 11.1. Patrons (6 canonical)

```
Patron {
  id                            // enum (see table below)
  name
  fellowship_bonus              // 0..+2
  special_effect                // typically: spend 1 Fellowship → effect
  favoured_callings             // narrative hint; not gating
}
```

Canonical Patrons (BR:6903–7160). Each special effect costs **1 Fellowship** to invoke unless noted otherwise.

| ID                  | Patron                      | Fellowship Bonus | Favoured Callings           | Special Effect                                                                                |
| ------------------- | --------------------------- | ---------------: | --------------------------- | --------------------------------------------------------------------------------------------- |
| `BALIN`             | Balin, son of Fundin        | +1               | Captain, Champion           | Make a combat roll Favoured                                                                   |
| `BILBO`             | Bilbo Baggins               | +2               | Treasure Hunter, Scholar    | "Find Patron" undertaking visiting Bilbo: +1 Fellowship until next Fellowship Phase           |
| `CIRDAN`            | Círdan the Shipwright       | +1               | Messenger, Scholar          | Re-roll any roll. Find Patron visiting Círdan: receive a rumour                               |
| `GANDALF`           | Gandalf the Grey            | +2               | Messenger, Captain          | Make a Shadow Test Favoured                                                                   |
| `GILRAEN`           | Gilraen the Fair            | 0                | Champion, Warden            | Within former Arnor: Journey Events resolved as Border Land (passive). Visit Gilraen: rumour  |
| `TOM_AND_GOLDBERRY` | Tom Bombadil & Goldberry    | +2               | Warden, Treasure Hunter     | Spend **all remaining** Fellowship: invoke Tom or Goldberry within Tom's domain               |

**Notes:**
- `fellowship_bonus: 0` is valid (Gilraen).
- `TOM_AND_GOLDBERRY` is a **single combined entry**, not two patrons.
- Bilbo's "Find Patron" effect is an **ephemeral modifier** that expires at the next Fellowship Phase; it should be modelled as a `TemporaryModifier` on the Company (see Phase 2 schema), never persisted into `max_fellowship` directly.

### 11.2. Fellowship rating computation

```
max_fellowship = number_of_player_heroes
               + (any_hobbit_hero_has_three_is_company ? 1 : 0)   // fixed +1 per Company
               + (count_of_bree_folk_heroes_with_bree_blood × 1)  // +1 per Bree-folk hero
               + patron_bonus                                      // varies by Patron (0..+2)
```

> The Three is Company bonus is a **single +1**, regardless of how many hobbits in the Company have selected the Virtue. See §4.7 for the same formula in the derived-stats context.

**Current Fellowship:**

- Initialised equal to `max_fellowship`.
- Decremented by spends (recover Hope or trigger Patron effects).
- **Fully restored at the end of each session.**

**Spending requires consensus from the entire Company.**

### 11.3. Fellowship Focus

- Each hero picks **1** other Company member (does not need to be mutual).
- When supporting (Support action) the Focus, grants (2d) instead of (1d).
- When the Focus is Wounded / suffers madness / is severely harmed: gain **1 automatic Shadow point (no Shadow Test possible)**.

### 11.4. Safe Haven

- Free text. Default Eriador suggestion: **Bree / Prancing Pony**.
- Other reachable locations: **Tharbad, Rivendell**.
- Function: base for Fellowship Phase undertakings.

---

## 12. Progression and Experience

### 12.1. Point types

| Type             | Use                                                  |
| ---------------- | ---------------------------------------------------- |
| Skill points     | Buy Skill ranks                                      |
| Adventure points | Buy Combat Proficiency ranks; raise VALOUR or WISDOM |

### 12.2. Earning

| Source                  | Skill points    | Adventure points |
| ----------------------- | --------------- | ---------------- |
| End of each session     | +3              | +3               |
| Yule (Fellowship Phase) | +WITS           | —                |
| (Alternative rate)      | +1/hour of play | +1/hour of play  |

### 12.3. Costs (Skills and Combat Proficiencies)

#### Skills

| Target rating | Cost (Skill points) |
| ------------- | ------------------- |
| 0 → 1         | 1                   |
| 1 → 2         | 2                   |
| 2 → 3         | 3                   |
| 3 → 4         | 5                   |
| 4 → 5         | 8 [VERIFICAR-PDF]   |
| 5 → 6         | 12 [VERIFICAR-PDF]  |

#### Combat Proficiencies

| Target rating | Cost (Adventure points) |
| ------------- | ----------------------- |
| 0 → 1         | 2                       |
| 1 → 2         | 4                       |
| 2 → 3         | 6                       |
| 3 → 4         | 10 [VERIFICAR-PDF]      |
| 4 → 5         | 16 [VERIFICAR-PDF]      |
| 5 → 6         | 24 [VERIFICAR-PDF]      |

### 12.4. Raising VALOUR and WISDOM

- Each new **VALOUR** rank → pick **1 Reward**.
- Each new **WISDOM** rank → pick **1 Virtue** (Standard, or Cultural if WISDOM ≥ 2).

| New rank | Cost (Adventure points) |
| -------- | ----------------------- |
| 2        | 8                       |
| 3        | 12                      |
| 4        | 20                      |
| 5        | 26                      |
| 6        | 30                      |

### 12.5. Adventuring career (expected pace)

- Heroes are expected to reach **VALOUR 5+ and WISDOM 5+** in ~10 years of in-game time.
- Recommended retirement around 20 years of adventuring.

### 12.6. Heirs

```
Heir {
  name: string
  family_skill: enum                     // inherited as additional Favoured
  previous_experience_pool: int          // 0..20
  heirlooms: Item[]                      // up to 1 (≥15 pts) or 2 (=20 pts)
}
```

- Yule Fellowship Phase Undertaking: "**Raise an Heir**".
- Spend up to 5 Treasure + 5 Adventure points per session.
- Ready to play when pool ≥ 10. Maximum 20.
- Inherits the Standard of Living of the original hero (not the cultural baseline).

---

## 13. Worked Example

**Scenario:** create a Hobbit of the Shire, Treasure Hunter named **Belba Bolger**, age 28.

### Step 1 — Culture: Hobbit of the Shire

- Cultural Blessing: **Hobbit-Sense** (WISDOM rolls Favoured; +1d on Shadow Tests vs Greed).
- Standard of Living: **Common** → starting Treasure 30.

### Step 2 — Attributes

Rolled 1 Success Die → result **5**:

| STRENGTH | HEART | WITS |
| -------- | ----- | ---- |
| 4        | 5     | 5    |

### Step 3 — TNs

- TN STRENGTH = 16
- TN HEART = 15
- TN WITS = 15

### Step 4 — Derived Stats

- max Endurance = 4 + 18 = **22**
- max Hope = 5 + 10 = **15**
- base Parry = 5 + 12 = **17**

### Step 5 — Skills and Combat Proficiencies (Hobbit)

Copies hobbit matrix. Underlined Skills (see `src/ref-data/cultural-skills.ts`): pick 1. Belba marks **STEALTH 3** as Favoured.

Base Hobbit Combat Proficiency: **Bows OR Swords (2)** → picks **Swords 2**.
Additional Combat Proficiency: **Bows 1**.

### Step 6 — Distinctive Features (Hobbit)

Belba picks: **Keen-Eyed** and **Inquisitive**.

### Step 7 — Name and Age

Name: **Belba Bolger** (canonical hobbit surname). Age: **28**.

### Step 8 — Calling: Treasure Hunter

- Shadow Path: **Dragon-Sickness**.
- Additional Distinctive Feature: **Burglary**.
- Favoured Skills (pick 2 of EXPLORE/SCAN/STEALTH):
  - **SCAN** → mark as Favoured.
  - **STEALTH** is already Favoured (no double-stamp).
  - Picks **EXPLORE** as the second → Favoured.

#### Previous Experience — 10 points

- STEALTH: 3 → 4 (5 points)
- SCAN: 0 → 1 (1 point)
- ATHLETICS: 0 → 1 (1 point)
- TRAVEL: 0 → 1 (1 point)
- HUNTING: 0 → 1 (1 point)
- LORE: 0 → 1 (1 point)

Total spent: **10 points**. ✓

#### Starting Gear

- Swords (2): **Sword** (Damage 4, Injury 16, Load 2).
- Bows (1): **Bow** (Damage 3, Injury 14, Load 2).
- Armour: **Leather Shirt** (1d Protection, Load 3).
- No helm, no shield (narrative choice).
- Useful Items: **2** (Common).
  - "Windproof lantern (SCAN)"
  - "Coil of rope with hook (ATHLETICS)"
- Travelling Gear: cloak, blanket, handkerchief, pipe, rations.

**Initial Load:** 2 + 2 + 3 = **7**.

#### VALOUR and WISDOM = 1

- Starting Reward: **Keen** applied to her **Sword** (Piercing Blow on Feat Die 9+).
- Starting Virtue: **Hardiness** (+2 max Endurance → 22 + 2 = **24**).

### Step 9 — Company

- Patron: **Bilbo Baggins**.
- Safe Haven: **Prancing Pony (Bree)**.
- Fellowship: 4 players → base 4 + Bilbo bonus (X) = **(verify Patron table)**.
- Fellowship Focus: another Player-hero (set after creation).

### Final Sheet (summary)

```
Name: Belba Bolger
Heroic Culture: Hobbit of the Shire
Cultural Blessing: Hobbit-Sense
Calling: Treasure Hunter
Shadow Path: Dragon-Sickness
Standard of Living: Common
Age: 28

Attributes:
  STRENGTH 4 (TN 16)
  HEART 5 (TN 15)
  WITS 5 (TN 15)

max Endurance: 24    (current: 24)
max Hope: 15          (current: 15)
base Parry: 17        (effective: 17)
Shadow: 0
Treasure: 30
Load: 7

Distinctive Features: Keen-Eyed, Inquisitive, Burglary
Flaws: —

Favoured Skills: STEALTH, SCAN, EXPLORE

Combat Proficiencies:
  Swords 2
  Bows 1
  Spears 0
  Axes 0

War Gear:
  Sword (4/16, Load 2) — Keen (Piercing Blow on 9+)
  Bow (3/14, Load 2)
  Leather Shirt (1d, Load 3)

Rewards: Keen on Sword (Starting)
Virtues: Hardiness (Starting)

VALOUR 1 / WISDOM 1
Skill points: 0
Adventure points: 0

Company: The Bagginses & Co.
Patron: Bilbo Baggins
Safe Haven: Prancing Pony (Bree)
Fellowship Focus: (TBD)
```

---

## 14. Validation Rules / Invariants

The webapp **must** reject (or warn-with-confirmation) violations of these invariants:

### 14.1. Critical invariants (block)

- [ ] `sum(skill_costs + proficiency_costs) ≤ 10` at creation.
- [ ] Attributes match exactly one row of the cultural table.
- [ ] Favoured Skills: at minimum the mandatory ones (culture + calling) are marked.
- [ ] Gear respects cultural restrictions (no Great Bow for Dwarves, etc.).
- [ ] Armour/shield respects minimum Standard of Living.
- [ ] Only **1 Starting Reward** and **1 Starting Virtue** at creation.
- [ ] `valour ∈ [1..6]` and `wisdom ∈ [1..6]`.
- [ ] `load ≥ 0` and `load ≤ max_endurance`.
- [ ] `current_endurance ∈ [0..max_endurance]` and `current_hope ∈ [0..max_hope]`.
- [ ] `shadow ≥ 0`.
- [ ] Each Reward applied **only once** to the same item.
- [ ] Cultural Virtue selectable only when `wisdom ≥ 2`.
- [ ] `fellowship_focus_ids` cannot include the hero's own `id`; max length 1 (or 2 if a hobbit hero in the Company has the **Three is Company** Cultural Virtue).
- [ ] A single roll cannot consume more than **1 Hope point** from the same hero (BR:379).

#### Per-Phase invariants

- [ ] Per Fellowship Phase: at most **1 Skill rank purchase per Skill**.
- [ ] Per Fellowship Phase: at most **1 Combat Proficiency rank purchase**.
- [ ] Per Yule: rank up **VALOUR or WISDOM**, not both.

### 14.2. Warnings (do not block)

- [ ] Age outside the typical cultural window.
- [ ] Standard of Living rises or drops unexpectedly.
- [ ] Skills rising above 4 (rare outside long campaigns).
- [ ] Character with Shadow ≥ max Hope (permanent Miserable possible).

### 14.3. Always-recompute derived state

- [ ] `tn_X = 20 − attributes.X` on every Attribute change.
- [ ] `max_endurance`, `max_hope`, `base_parry` recomputed when culture, attributes, virtues, or rewards change.
- [ ] `load` recomputed on every gear change.
- [ ] `conditions.weary`, `conditions.miserable`, and `conditions.overwhelmed` recomputed on every state change.
- [ ] Shadow gained beyond `max_hope` is **discarded** (clamp), never persisted above the cap.
- [ ] `max_fellowship` recomputed when members, virtues, blessings, or patron change.

---

## 15. Anti-patterns / Common Mistakes

DO NOT do any of the following in the webapp:

- **DO NOT** allow manual editing of `tn_*`, `max_endurance`, `max_hope`, `base_parry`, `load` — all derived.
- **DO NOT** allow `current_endurance > max_endurance` (idem Hope/Fellowship).
- **DO NOT** accept negative Shadow.
- **DO NOT** double-stamp Favoured when culture and calling pick the same Skill (boolean, not counter).
- **DO NOT** apply the Dwarven Blessing reduction to shields (rule covers armour + helm only).
- **DO NOT** add the shield's bonus to `base_parry` outside combat mode; keep `effective_parry` as a derived field computed on the fly.
- **DO NOT** zero Fellowship at the start of a new session — it **restores** at the end, not the beginning.
- **DO NOT** auto-change Standard of Living without narrative confirmation from the player.
- **DO NOT** allow spending Hope / Fellowship when current = 0.
- **DO NOT** apply two identical Rewards to the same item.
- **DO NOT** assume Virtues are unique — most Standard Virtues are repeatable; store as array.
- **DO NOT** treat the Starting Reward as a stat modifier — it is always a gear upgrade applied to a specific item, like any War-Gear Reward. Only the Starting Virtue can modify stats at creation.
- **DO NOT** display Cultural Virtues before WISDOM ≥ 2.
- **DO NOT** persist combat stance. Stance is chosen per round; not a sheet field.
- **DO NOT** persist `helm_removed_in_combat` across sessions. It is a runtime, combat-scoped flag — its effect on Load is real, but the flag itself resets on combat exit.
- **DO NOT** recompute permanent Fellowship from temporary undertaking modifiers. Keep `max_fellowship` (permanent, derived from §4.7) separate from `Company.temporary_modifiers[]` (e.g. Strengthen Fellowship +1, Find Patron Bilbo +1) which expire at the next Fellowship Phase.

---

## 16. Implementation Notes

### 16.1. Player-hero ↔ Loremaster sharing

Suggested models (pick one):

- **Read-only mode:** Loremaster sees all sheets in real time, no editing. Player edits their own sheet.
- **Comment mode:** Loremaster can attach notes / suggest changes without applying them (PR-like workflow).
- **Co-edit with audit:** Loremaster edits specific fields (e.g. apply Shadow, mark Wounded) with a who-did-what log.

Recommendation: **read-only mode for the Loremaster on hero-owned fields** + **shared editing for Company-level fields** (current Fellowship, Patron, Safe Haven).

### 16.2. Per-session state

Snapshot the sheet per session (timestamps), allowing rollback. Useful for:

- Recovering from input errors.
- Visualising progression at campaign end.
- Auditing Hope expenditure / Shadow gained.

### 16.3. Domain events (Event Sourcing — optional)

```
Expected events:
  CharacterCreated(payload)
  AttributeChanged(which, before, after, reason)
  EnduranceLost(amount, source)
  EnduranceRestored(amount, rest_type)
  HopeSpent(roll_id, amount)
  HopeRestored(amount, source)
  ShadowGained(amount, source)
  ShadowRemoved(amount, source)
  ConditionMarked(condition)
  ConditionCleared(condition)
  LoadRecomputed(before, after)
  ValourIncreased(new_rank, chosen_reward)
  WisdomIncreased(new_rank, chosen_virtue)
  GearAdded(item)
  GearRemoved(item)
  RewardApplied(reward, target_item)
  TreasureGained(amount, source)
  TreasureSpent(amount, source)
  StandardOfLivingChanged(before, after)
  FellowshipFocusSet(target_character_id)
```

Lets you reconstruct any state and gives a complete narrative history of the hero's career.

### 16.4. Internationalisation

The English terms in this spec are canonical. To support a `pt-BR` UI surface (matching the Devir translation that some players use), maintain a translation map. The dictionary below is the canonical seed; it must be kept in sync with `src/app/i18n/`.

#### Core terminology

```json
{
  "STRENGTH": "FORÇA",
  "HEART": "CORAÇÃO",
  "WITS": "ASTÚCIA",
  "Endurance": "Resistência",
  "Hope": "Esperança",
  "Parry": "Bloqueio",
  "Shadow": "Sombra",
  "Shadow Scar": "Cicatriz de Sombra",
  "Load": "Carga",
  "Fatigue": "Fadiga",
  "Standard of Living": "Padrão de Vida",
  "Treasure": "Tesouro",
  "VALOUR": "VALOR",
  "WISDOM": "SABEDORIA",
  "Reward": "Recompensa",
  "Virtue": "Virtude",
  "Distinctive Feature": "Característica Notável",
  "Cultural Blessing": "Bênção Cultural",
  "Heroic Culture": "Cultura Heroica",
  "Calling": "Chamado",
  "Shadow Path": "Caminho das Sombras",
  "Flaws": "Defeitos",
  "Company": "Companhia",
  "Fellowship": "Sociedade",
  "Fellowship Focus": "Foco da Sociedade",
  "Patron": "Patrono",
  "Safe Haven": "Refúgio Seguro",
  "Loremaster": "Historiador",
  "Feat Die": "Dado de Façanha",
  "Success Die": "Dado de Sucesso",
  "Piercing Blow": "Golpe Perfurante",
  "Heavy Blow": "Golpe Pesado"
}
```

#### Conditions and roll states

```json
{
  "Inspired": "Inspirado",
  "Favoured": "Favorecida",
  "Ill-favoured": "Desfavorecida",
  "Miserable": "Arrasado",
  "Weary": "Exausto",
  "Wounded": "Ferido",
  "Dying": "Morrendo",
  "Overwhelmed": "Sucumbindo à Sombra",
  "Magical Success": "Sucesso Mágico",
  "Special Success": "Sucesso Especial",
  "Standard Risk": "Risco Padrão",
  "Perilous Risk": "Perigoso",
  "Reckless": "Imprudente",
  "Mishap": "Infortúnio",
  "Disaster": "Desastre",
  "Steadfast Will": "Firmar Vontade",
  "Madness Attack": "Ataque de Loucura",
  "Gandalf rune": "Runa de Gandalf",
  "Eye of Sauron": "Olho de Sauron"
}
```

#### Shadow sources

```json
{
  "Dread": "Pavor",
  "Greed": "Ganância",
  "Sorcery": "Feitiçaria",
  "Misdeeds": "Transgressões"
}
```

#### Heroic Cultures

```json
{
  "Dwarves of Durin's Folk": "Anões do Povo de Durin",
  "Bardings": "Bardeses",
  "Elves of Lindon": "Elfos de Lindon",
  "Hobbits of the Shire": "Hobbits do Condado",
  "Men of Bree": "Homens de Bri",
  "Rangers of the North": "Patrulheiros do Norte"
}
```

#### Callings

```json
{
  "Captain": "Capitão",
  "Champion": "Campeão",
  "Messenger": "Mensageiro",
  "Scholar": "Erudito",
  "Treasure Hunter": "Caçador de Tesouros",
  "Warden": "Guardião"
}
```

#### Shadow Paths

```json
{
  "Dragon-Sickness": "Doença do Dragão",
  "Curse of Vengeance": "Maldição da Vingança",
  "Lure of Power": "Tentação do Poder",
  "Lure of Secrets": "Tentação dos Segredos",
  "Path of Despair": "Caminho do Desespero",
  "Wandering-Madness": "Loucura da Vagância"
}
```

#### Skills (18)

```json
{
  "Awe": "FASCÍNIO",
  "Athletics": "ATLETISMO",
  "Awareness": "VIGILÂNCIA",
  "Hunting": "CAÇADA",
  "Song": "MÚSICA",
  "Craft": "OFÍCIO",
  "Enhearten": "INDUÇÃO",
  "Travel": "VIAGEM",
  "Insight": "DISCERNIMENTO",
  "Healing": "CURA",
  "Courtesy": "CORTESIA",
  "Battle": "BATALHA",
  "Persuade": "PERSUASÃO",
  "Stealth": "FURTIVIDADE",
  "Scan": "BUSCA",
  "Explore": "EXPLORAÇÃO",
  "Riddle": "ENIGMA",
  "Lore": "HISTÓRIA"
}
```

#### Distinctive Features — 24 cultural

```json
{
  "Bold": "Bravo",
  "Cunning": "Astuto",
  "Eager": "Ansioso",
  "Faithful": "Fiel",
  "Fair": "Belo",
  "Fair-Spoken": "Eloquente",
  "Fierce": "Feroz",
  "Generous": "Generoso",
  "Honourable": "Honrado",
  "Inquisitive": "Inquisitivo",
  "Keen-Eyed": "Olhar Aguçado",
  "Lordly": "Nobre",
  "Merry": "Alegre",
  "Patient": "Paciente",
  "Proud": "Orgulhoso",
  "Rustic": "Rústico",
  "Secretive": "Sigiloso",
  "Stern": "Severo",
  "Subtle": "Sutil",
  "Swift": "Ágil",
  "Tall": "Alto",
  "True-Hearted": "Sincero",
  "Wary": "Cauteloso",
  "Wilful": "Teimoso"
}
```

#### Distinctive Features — 6 calling-exclusive

```json
{
  "Burglary": "Ladroagem",
  "Enemy-Lore": "Conhecimento sobre Inimigos",
  "Leadership": "Liderança",
  "Rhymes of Lore": "Rimas de História",
  "Shadow-Lore": "História da Sombra",
  "Folk-Lore": "História dos Povos"
}
```

#### Devir-canon corrections

The Devir translation has a few known cases where the canonical pt-BR term diverges from earlier drafts. These are normative:

| English          | Canonical pt-BR (Devir) | Stale form to avoid |
| ---------------- | ----------------------- | ------------------- |
| Stern            | Severo                  | Teimoso             |
| Wilful           | Teimoso                 | Severo              |
| Great Spear      | Lança Grande            | Lança Longa         |
| Reinforced       | Reforçado               | Reforço de Bloqueio |

> Code identifiers, schema field names, enum values, and event names stay English. Only display labels are localised.

### 16.5. Known gaps (verify against `THE_ONE_RING_BASIC_RULES.md`)

The following items remain pending or are deferred to a later version. Each cites a section anchor in `THE_ONE_RING_BASIC_RULES.md` for context.

1. Underlined Skills per culture (1 of 2 marked as Favoured at creation) — the markdown extraction does not preserve underline formatting; resolved in `src/ref-data/cultural-skills.ts`. Confirm visually against the Devir PDF if doubt remains.
2. Skill costs for ranks **4→5 and 5→6** (8, 12) — basic-rules §"FAZER ATUALIZAÇÕES — CUSTOS DE PONTOS DE EXPERIÊNCIA" (linhas 3739–3756). The combined PDF table dropped its rank icons; flagged `[VERIFICAR-PDF]` in §12.3 pending visual confirmation.
3. Combat Proficiency costs for ranks **3→4, 4→5, 5→6** (10, 16, 24) — same anchor; flagged `[VERIFICAR-PDF]` in §12.3.
4. **Enchanted Rewards** — basic-rules §"RECOMPENSAS ENCANTADAS" (linhas 5658+). v1+ scope.
5. **Cursed Items** — basic-rules §"ITENS AMALDIÇOADOS" (linhas 5828–5870). v1+ scope.
6. **Special Successes table per Skill** (Tengwar effects per skill) — not fully captured in the basic-rules excerpt. v1+ scope (Phase 4 of refinement plan).

> Items removed from this list once resolved: Bardings/Hobbit attribute rows, Dwarven Distinctive Features, Patron table, Bree virtue placeholders ("Bold and Hale", "Stout"), Ranger virtue placeholder ("Hidden Sentinel") — see Phase 0 / Phase 1 of `docs/plans/2026-05-01-domain-spec-refinement.md`.

---

## 17. Self-Validation Checklist

Before closing a sheet version (creation or edit), the webapp must verify:

- [ ] All required fields populated.
- [ ] All derived values recomputed.
- [ ] All §14.1 invariants satisfied.
- [ ] Previous Experience points fully allocated (at creation).
- [ ] At least 3 Distinctive Features (2 cultural + 1 calling).
- [ ] 1 Starting Reward and 1 Starting Virtue assigned.
- [ ] Heroic Culture, Calling, and Cultural Blessing consistent.
- [ ] Company linked (with Patron and Safe Haven).
- [ ] `valour = 1` and `wisdom = 1` at the moment of creation.

If any check fails: block submission and surface the offending field(s).

---

## 18. Recommended React Architecture

This section translates the domain spec above into concrete implementation guidance for a React-based webapp.

> **Assumed context** (challenge any assumption that doesn't fit your case):
>
> - **1 Loremaster + 3–6 Player-heroes** per Company (typical TTRPG group size).
> - **Single owner per sheet** — the Player-hero edits; the Loremaster reads. No co-editing inside one sheet → no CRDTs.
> - **Desktop-first, mobile-friendly** UI.
> - **Deployment-agnostic** — the architecture works on a single VPS, a PaaS (Railway / Render / Fly.io), or a container service. No cloud-specific lock-in.

### 18.1. Stack at a Glance

| Concern            | Recommendation                                     | Rationale                                                                                                                                                                                                                                                                                       |
| ------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build tool         | **Vite**                                           | Fastest HMR for React; native ESM; minimal config; first-class TS.                                                                                                                                                                                                                              |
| Package manager    | **pnpm** workspaces                                | Efficient disk + install for monorepos; the monorepo is justified by the shared `@theonesheet/domain` package (see §18.3).                                                                                                                                                                      |
| Language           | **TypeScript** strict mode                         | The domain has many invariants — types catch them cheaply.                                                                                                                                                                                                                                      |
| UI framework       | **React 19**                                       | The Compiler removes most `useMemo`/`useCallback` boilerplate.                                                                                                                                                                                                                                  |
| Styling            | **Tailwind CSS v4** + **shadcn/ui**                | Utility-first speeds layout for a sheet-heavy UI; shadcn primitives are copy-paste owned, no dependency surface.                                                                                                                                                                                |
| Routing            | **TanStack Router**                                | Type-safe params + search params; first-class TanStack Query integration. (React Router v7 is a fine swap if you prefer wider familiarity — it doesn't change the rest of the architecture.)                                                                                                    |
| Server state       | **TanStack Query**                                 | De-facto standard for React + REST/SSE; cache invalidation handled.                                                                                                                                                                                                                             |
| Client UI state    | **Zustand**                                        | Tiny, no boilerplate, fits ephemeral state (modal open, current wizard phase).                                                                                                                                                                                                                  |
| Forms              | **React Hook Form** + Zod resolver                 | Best-in-class for complex multi-step forms; uncontrolled inputs keep wizard pages snappy. (TanStack Form is a credible alternative if you want fully type-safe field paths, but the ecosystem and docs around RHF are larger.)                                                                  |
| Validation         | **Zod**                                            | One schema serves frontend forms, API contracts, and inferred TS types. First-class react-hook-form resolver. (Valibot is smaller-bundle but has weaker form-library integration.)                                                                                                              |
| API server         | **Fastify**                                        | Mature, plugin-rich, schema-first validation, great TS DX, excellent perf for a Node target. (**Hono** is a credible greenfield alternative — smaller core, runtime-portable to Bun/Deno/edge — pick it if portability matters more than plugin ecosystem.)                                     |
| Database           | **PostgreSQL** (≥ 14)                              | Schema is relational with some JSONB; Postgres handles both natively.                                                                                                                                                                                                                           |
| ORM / migrations   | **Drizzle ORM** + **drizzle-kit**                  | SQL-like API (`db.select().from(...)`), end-to-end type safety, schema-diff migrations generated as **plain SQL files** (committed and reviewable), `drizzle-zod` integrates with the `@theonesheet/schema` Zod source-of-truth, raw SQL escape hatch via `sql\`\`` template. (See Decision 6.) |
| Realtime           | **Server-Sent Events (SSE)** via `@fastify/sse-v2` | One-way Loremaster view; no WebSocket infra; trivial in Fastify. (See §18.5.)                                                                                                                                                                                                                   |
| Authentication     | **Better Auth**                                    | Modern, batteries-included session auth (email + magic link, OAuth providers, passkeys); active maintenance; works with any DB driver. (Lucia v3 was deprecated as a library and lives on as a learning resource — don't pick it for greenfield in 2026.)                                       |
| Tests (unit)       | **Vitest** + **React Testing Library**             | De facto choice for Vite projects; ESM-native; instant test feedback.                                                                                                                                                                                                                           |
| Tests (API routes) | **Vitest** + `fastify.inject()`                    | Built-in, no real HTTP server needed; canonical Fastify test pattern.                                                                                                                                                                                                                           |
| Tests (E2E)        | **Playwright**                                     | Realistic browser; auto-wait; works offline against your local stack.                                                                                                                                                                                                                           |

### 18.2. Architectural Decisions (the meaningful tradeoffs)

The following decisions are not obvious — each has a real alternative worth weighing.

#### Decision 1 — Single owner per sheet (no co-editing)

> **Decision:** the Player-hero owns their sheet. The Loremaster has read-only access via SSE. Some Company-level fields (`current_fellowship`, `patron`, `safe_haven`) are owned by the `Company` entity, edited collaboratively but with last-write-wins semantics.

**Alternative considered:** CRDT-based co-editing (Yjs/Automerge).
**Why rejected:** real co-editing is overkill here. Each sheet has a clear single owner during play. Loremasters don't typically edit a Player-hero's stats; they apply Shadow / Wounds via dedicated actions that the system persists. CRDT runtime + storage adds 50KB+ to the bundle and significantly complicates the schema.

#### Decision 2 — Pure-function domain layer (shared frontend + backend)

> **Decision:** all formulas from §4, validation from §14, and reference tables from §6/§7/§8/§10 live in a `@theonesheet/domain` package as pure TypeScript functions. Both the React app and the Fastify API import them.

**Alternative considered:** computing derived values server-side only.
**Why rejected:** the UI must show TN, max Endurance, Load, Parry **instantly** as the player adjusts inputs. Round-tripping every keystroke kills UX. Pure functions client-side give instant feedback; the backend re-validates on every write to enforce truth.

This is the single most important architectural choice in the app.

#### Decision 3 — SSE over WebSockets for realtime

> **Decision:** push sheet updates from server to Loremaster via Server-Sent Events. Player edits use plain REST `POST`/`PATCH`.

**Alternative considered:** WebSockets (e.g. via `fastify-websocket`) for bidirectional sync.
**Why rejected:** for this app, the only "realtime" requirement is the Loremaster watching. Players don't need to see other players' sheets in realtime. SSE is one-way (server → client), built into HTTP, supported natively by browsers, and trivial to implement in Fastify. No connection management, no reconnect logic, no back-pressure surprises.

If requirements grow (e.g. live dice rolls broadcast to the Company), WebSockets can be added without rewriting the SSE code.

#### Decision 4 — Zod schema as single source of truth

> **Decision:** every entity in §3 is defined as a Zod schema in `@theonesheet/schema`. TypeScript types are inferred via `z.infer`. The same schema validates API requests on the backend and forms on the frontend.

**Alternative considered:** separate TypeScript types + manual JSON Schema for API.
**Why rejected:** drift between layers is the single most expensive bug class in TS apps. Zod-first eliminates it.

#### Decision 5 — TanStack Router over React Router

> **Decision:** TanStack Router for type-safe routing with first-class TanStack Query integration.

**Alternative considered:** React Router v7.
**Why this is a soft preference:** React Router v7 is fine and has wider familiarity. TanStack Router gives end-to-end type safety on params + search params, which matches the strict-typing posture of the rest of the stack. If you're already comfortable with React Router and don't want to learn a new tool, that's a reasonable swap — it doesn't change the rest of the architecture.

#### Decision 6 — Drizzle ORM over raw SQL

> **Decision:** Drizzle ORM + drizzle-kit migrations for the Postgres layer.

**Alternatives considered:** raw SQL queries + hand-written migrations (with `node-postgres` or `postgres`); Prisma; Kysely.

**Why Drizzle wins here:**

- **SQL-like API that doesn't hide what's happening.** `db.select().from(characters).where(eq(characters.id, id))` reads like SQL, runs as the SQL you'd write. No `findMany({ include: { ... } })` magic.
- **End-to-end type safety** from the DB column to the API response, without code generation steps.
- **Schema-diff migrations via drizzle-kit**, emitted as **plain SQL files** that you commit and review. You get the auditability of raw SQL with the ergonomics of a typed schema.
- **`drizzle-zod` integration** lets `@theonesheet/schema` derive from (or align with) Drizzle table definitions — closing the loop on Decision 4.
- **Raw SQL escape hatch** via `sql\`\`` for the rare cases the query builder won't express what you need.

**Why not raw SQL queries + hand-written migrations:** you trade DX and type safety for control you almost never use. The schema in §3 has nested JSONB and enum constraints — manually keeping TS types in sync with column shapes is busywork that pays nothing.

**Why not Prisma:** heavier runtime, generated client, schema language separate from TS, more opinionated. Fine for very large teams; overweight for this scope.

**Why not Kysely:** type-safe pure query builder is great, but you have to bolt on a separate migration tool and maintain TS types separately. Drizzle bundles both.

### 18.3. Project Structure

```
the-one-sheet/
├── apps/
│   ├── web/                    # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── routes/         # TanStack Router file-based
│   │   │   ├── features/       # vertical slices
│   │   │   │   ├── creation/   # 9-phase wizard
│   │   │   │   ├── sheet/      # main sheet view
│   │   │   │   ├── company/    # Company / Fellowship view
│   │   │   │   └── lm-dashboard/ # Loremaster overview
│   │   │   ├── lib/            # query client, SSE adapter, etc.
│   │   │   └── components/     # shared UI (mostly shadcn re-exports)
│   │   └── tests/
│   └── api/                    # Fastify backend
│       ├── src/
│       │   ├── routes/         # REST endpoints
│       │   ├── sse/            # SSE channel handlers
│       │   ├── db/             # Drizzle schema, query helpers
│       │   ├── auth/           # Better Auth integration
│       │   └── domain-bridge/  # imports @theonesheet/domain for re-validation
│       └── drizzle/            # generated SQL migrations (committed)
├── packages/
│   ├── schema/                 # @theonesheet/schema — Zod schemas (Character, Skill, Reward, ...)
│   ├── domain/                 # @theonesheet/domain — pure functions (computeMaxEndurance, validateLoad, ...)
│   └── ref-data/               # @theonesheet/ref-data — static tables (cultures, callings, weapons)
├── pnpm-workspace.yaml
└── turbo.json (or moon.yml)
```

#### Why this layout

- **`features/` over `pages/` + `components/`** — vertical slicing keeps related code (component + hook + types) co-located. Easier to delete a feature; harder to create god-files.
- **`@theonesheet/schema`, `@theonesheet/domain`, `@theonesheet/ref-data` separated** — schema is the type contract; domain is logic; ref-data is the static lookup tables (the matrices in §6.3, the weapons table in §8.1, etc.). All three are imported by both `apps/web` and `apps/api`.
- **No shared `ui` package** — shadcn/ui is meant to be copy-paste owned. If two apps need the same component, copy it.

### 18.4. Frontend Patterns

#### State boundaries

| What                                                | Where                                                    | Why                                         |
| --------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------- |
| Server state (sheet data, Company, Patrons)         | TanStack Query                                           | Cached, deduplicated, invalidated cleanly.  |
| Wizard step / modal / sidebar                       | Zustand                                                  | Ephemeral, doesn't belong in URL or server. |
| Current route, query params, dialog params          | TanStack Router                                          | Shareable URLs; browser back button works.  |
| Form draft (during a wizard phase)                  | React Hook Form local state                              | Best-in-class form perf and validation.     |
| **Derived values (TN, max Endurance, Load, Parry)** | `@theonesheet/domain` pure functions called in `useMemo` | Instant, testable, shared with backend.     |

#### Computed values — the canonical pattern

```ts
// @theonesheet/domain/derived-stats.ts
export function computeMaxEndurance(
  culture: HeroicCulture,
  attributes: Attributes,
  virtues: Virtue[],
): number {
  const base = CULTURE_FORMULAS[culture].endurance(attributes.strength);
  const hardinessBonus =
    virtues.filter((v) => v.name === 'Hardiness').length * 2;
  return base + hardinessBonus;
}
```

```tsx
// apps/web/src/features/sheet/StatsPanel.tsx
const maxEndurance = useMemo(
  () =>
    computeMaxEndurance(
      character.heroic_culture,
      character.attributes,
      character.virtues,
    ),
  [character],
);
```

Pure functions + `useMemo`. No effect, no `setState`, no surprise. The same function runs on the backend before persisting any change.

> **React 19 note:** the React Compiler can elide most `useMemo`s. You can write the call directly; the compiler handles memoisation. Keep `useMemo` for documentation purposes only when the dependency surface is non-obvious.

#### Forms — the wizard pattern

Each of the 9 creation phases (§5) is a separate route under `/character/new/`. Each phase owns its own React Hook Form instance, with a schema slice from `@theonesheet/schema`. Phase data is persisted to the backend at the end of each phase (atomic per phase) — not as one giant submission at the end. This means:

- A user can quit mid-wizard and resume.
- Phase 8c (spending Previous Experience) can validate against partial state.
- The backend never sees a half-typed sheet.

Use `useForm({ resolver: zodResolver(phaseSchema) })` per phase. Pass the resolved phase data through the existing `Character` API mutations.

### 18.5. Realtime Strategy

```
Player-hero (browser)
    │
    │ HTTP POST /api/characters/:id  ← edits
    ▼
Fastify API
    │
    ├── persist to Postgres
    │
    └── publish to in-memory SSE channel for company:{company_id}
                │
                ▼
Loremaster (browser)  ← SSE subscription on /api/companies/:id/stream
```

**Implementation sketch:**

```ts
// apps/api/src/sse/company-channel.ts
const channels = new Map<CompanyId, Set<FastifyReply>>();

export function publish(companyId: CompanyId, event: DomainEvent) {
  const subs = channels.get(companyId) ?? new Set();
  for (const reply of subs) {
    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
  }
}

// Fastify route
fastify.get('/api/companies/:id/stream', async (req, reply) => {
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');

  const subs = channels.get(req.params.id) ?? new Set();
  subs.add(reply);
  channels.set(req.params.id, subs);

  req.raw.on('close', () => subs.delete(reply));
});
```

**On the frontend:**

```ts
// apps/web/src/lib/sse.ts
const eventSource = new EventSource(`/api/companies/${companyId}/stream`);
eventSource.onmessage = (e) => {
  const event = JSON.parse(e.data);
  queryClient.invalidateQueries({
    queryKey: ['character', event.character_id],
  });
};
```

Domain events fired via SSE match the list in §16.3. The Loremaster's `useQuery` cache invalidates → React re-renders the changed sheet.

> **Scaling note:** the in-memory channel works fine for a single API instance. If you ever run multiple instances behind a load balancer, swap the in-memory `Map` for Redis pub/sub, NATS, or Postgres `LISTEN/NOTIFY` — the publish/subscribe contract stays the same; only the transport changes.

### 18.6. Backend Shape (brief)

| Concern       | Approach                                                                                                                                                                                                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API style     | REST with explicit resources (`/characters`, `/companies`, `/sessions`). No GraphQL — overhead unjustified for this scope.                                                                                                                                                                      |
| Schema        | Drizzle table definitions in `apps/api/src/db/schema.ts`; one table per top-level entity (`characters`, `companies`, `change_log`, `sessions`); JSONB columns for nested objects (`war_gear`, `attributes`, `skills`). Migrations generated via `drizzle-kit generate`, committed as plain SQL. |
| Re-validation | Every write passes through `@theonesheet/domain` validators before hitting Postgres. Never trust client-computed derived values — the API recomputes from inputs.                                                                                                                               |
| Auth          | Session-based via Better Auth (DB-backed). Roles: `player`, `loremaster`, `admin`. Per-route authorisation via Fastify hooks.                                                                                                                                                                   |
| Audit log     | Every mutation appends an entry to `change_log` (the §16.3 events). Used for the history feature and for SSE replay if a Loremaster reconnects.                                                                                                                                                 |

### 18.7. Testing Strategy

| Layer                 | Tool                        | What to test                                                                                                                      |
| --------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `@theonesheet/domain` | Vitest                      | Every formula in §4. Every invariant in §14. Worked example in §13 reproducible. **This is where you spend most testing effort.** |
| `@theonesheet/schema` | Vitest                      | Round-trip `Character` through Zod parse → serialise → parse.                                                                     |
| Component logic       | RTL + Vitest                | Form validation triggers, conditional rendering by phase, derived value display.                                                  |
| API routes            | Vitest + `fastify.inject()` | One happy-path + one validation-failure test per endpoint. No HTTP server needed.                                                 |
| End-to-end            | Playwright                  | One test per user journey: full creation, mid-creation resume, Loremaster sees player edit.                                       |

The domain package is where complexity lives. If `@theonesheet/domain` is well-tested, the rest of the app is mostly UI plumbing.

### 18.8. Implementation Roadmap

A reasonable phasing for a small team:

**Phase 1 — Foundation (1–2 weeks)**

- Monorepo skeleton; Vite + Fastify boot; shadcn/ui set up.
- `@theonesheet/schema` with `Character`, `Attributes`, `Skill` Zod schemas.
- `@theonesheet/domain` with TN computation, max Endurance, max Hope, base Parry, Load.
- Vitest suite covering all of §4 formulas.

**Phase 2 — Creation wizard (2–3 weeks)**

- 9-phase wizard, route per phase.
- Cultural reference data seeded.
- Worked example (§13) reproducible end-to-end.

**Phase 3 — Sheet view + persistence (1–2 weeks)**

- Read/write API.
- Sheet view with all panels.
- Per-session change log.

**Phase 4 — Company + Loremaster view (1–2 weeks)**

- Company entity.
- Loremaster dashboard listing all Player-heroes.
- SSE channel + frontend subscription.

**Phase 5 — Progression & polish (1+ weeks)**

- VALOUR/WISDOM rank-up flow.
- Cultural Virtues unlock at WISDOM 2.
- Mobile responsiveness pass.
- E2E test suite.

---

## Appendix A — Cross-references to `THE_ONE_RING_BASIC_RULES.md`

> The canonical source for this spec is the markdown extraction in `docs/THE_ONE_RING_BASIC_RULES.md` (Devir pt-BR edition). Earlier versions of this document referenced the Free League PDF by page number; those references have been rebound to section anchors below. Line numbers are approximate (within ±5 of the heading) and may drift when the file is re-extracted; the section name (`§"…"`) is the durable anchor.

| Topic                              | Section anchor (basic-rules)                                           | ~line  |
| ---------------------------------- | ---------------------------------------------------------------------- | ------ |
| Action Resolution + sheet overview | §"RESOLUÇÃO DE AÇÕES" → §"PROCEDIMENTO DA JOGADA DE DADOS"             | 192–475 |
| Adventurers (cultures, callings)   | §"AVENTUREIROS" → §"CRIANDO O HERDEIRO"                                | 550–1746 |
| Dwarves of Durin's Folk            | §"ANÕES DO POVO DE DURIN"                                              | 662–750 |
| Bardings                           | §"BARDESES"                                                            | 752–836 |
| Elves of Lindon                    | §"ELFOS DE LINDON"                                                     | 838–930 |
| Hobbits of the Shire               | §"HOBBITS DO CONDADO"                                                  | 932–1024 |
| Men of Bree                        | §"HOMENS DE BRI"                                                       | 1026–1112 |
| Rangers of the North               | §"PATRULHEIROS DO NORTE"                                               | 1114–1202 |
| Callings (six)                     | §"CHAMADOS" → §"MENSAGEIRO"                                            | 1204–1340 |
| Previous Experience                | §"EXPERIÊNCIA ANTERIOR"                                                | 1340–1370 |
| Starting Gear                      | §"EQUIPAMENTO INICIAL" → §"PÔNEIS E CAVALOS"                           | 1370–1517 |
| Starting Reward and Virtue         | §"RECOMPENSA INICIAL E VIRTUDE"                                        | 1517–1551 |
| The Company                        | §"A COMPANHIA" → §"O REFÚGIO SEGURO"                                   | 1552–1604 |
| Fellowship rating + Focus          | §"VALOR DE SOCIEDADE" → §"FOCO DA SOCIEDADE"                           | 1608–1646 |
| Adventuring Career / Heirs         | §"EXPERIÊNCIA" → §"CRIANDO O HERDEIRO"                                 | 1646–1746 |
| Characteristics (skills, etc.)     | §"CARACTERÍSTICAS"                                                     | 1730–2390 |
| Skills (18)                        | §"PERÍCIAS" → §"VIGILÂNCIA"                                            | 1746–1948 |
| Combat Proficiencies (4)           | §"PROFICIÊNCIAS DE COMBATE" → §"ATAQUES DE BRIGA"                      | 1948–2013 |
| Distinctive Features (24+6)        | §"CARACTERÍSTICAS NOTÁVEIS" → §"TEIMOSO"                               | 2013–2169 |
| Endurance and Hope                 | §"RESISTÊNCIA E ESPERANÇA" → §"FERIMENTOS GRAVES"                      | 2131–2210 |
| Standard of Living                 | §"PADRÕES DE VIDA" → §"MELHORAR O PADRÃO DE VIDA"                      | 2213–2289 |
| War Gear (detail)                  | §"EQUIPAMENTO DE GUERRA" → §"ESCUDOS"                                  | 2289–2390 |
| Valour and Wisdom                  | §"VALOR E SABEDORIA"                                                   | 2389–2414 |
| Rewards (6 standard)               | §"RECOMPENSAS" → §"REFORÇADO"                                          | 2414–2475 |
| Items of high value, Named Weapons | §"ITENS DE VALOR SUPERIOR" → §"ARMAS NOMEADAS"                         | 2476–2495 |
| Standard Virtues (6)               | §"VIRTUDES" → §"RESILIÊNCIA"                                           | 2496–2542 |
| Cultural Virtues (6 × 6 = 36)      | §"VIRTUDES CULTURAIS" → §"REALEZA REVELADA"                            | 2544–2873 |
| Combat (sheet-touching parts)      | §"COMBATE" → §"FUJAM, SEUS TOLOS!"                                     | 2923–3357 |
| Wounds + First Aid                 | §"FERIMENTOS" → §"COMPLICAÇÕES E VANTAGENS"                            | 3230–3284 |
| Council                            | §"ENCONTROS SOCIAIS" → §"FIM DE UM CONSELHO"                           | 3359–3457 |
| Journey                            | §"JORNADA" → §"DESCREVENDO EVENTOS DE JORNADA"                         | 3457–3690 |
| Fellowship Phase + undertakings    | §"FASES DE SOCIEDADE" → §"RECONTAR UMA HISTÓRIA"                       | 3688–3932 |
| Risk Levels                        | §"AS CONSEQUÊNCIAS DO FRACASSO" → §"DESASTRE!"                         | 4084–4150 |
| Skill Challenges                   | §"DESAFIOS DE PERÍCIA" → §"PERSONAGENS DO HISTORIADOR"                 | 4147–4267 |
| The Shadow                         | §"A SOMBRA" → §"HERÓIS FALHOS"                                         | 4315–4520 |
| Shadow Paths (six)                 | §"MALDIÇÃO DA VINGANÇA" → §"LOUCURA DA VAGÂNCIA"                       | 4522–4596 |
| Famous Weapons + Enchanted Rewards | §"ARMAS E ARMADURAS FAMOSAS" → §"VOO DIRETO"                           | 5557–5828 |
| Cursed Items                       | §"ITENS AMALDIÇOADOS" → §"OBJETOS PRECIOSOS AMALDIÇOADOS"              | 5828–5870 |
| Eye of Mordor (campaign mode)      | §"O OLHO DE MORDOR" → §"EPISÓDIOS DE REVELAÇÃO"                        | 5889–6050 |
| Patrons (canonical 6 — appendix)   | §"PATRONOS" appendix (Balin, Bilbo, Círdan, Gandalf, Gilraen, Tom & Goldberry) | 6903–7160 |

---

## Appendix A. Content scope and licensing

> Originally `docs/CONTENT_TOR2E.md`. Folded in here so domain-content rules live next to the spec they constrain.

- The MVP supports **The One Ring 2e core book only**. Loremaster's Guide and supplements are out of scope.
- This is **internal use only** for the maintainer's RPG group; no public release.
- Reference data should structure mechanics (numbers, formulas, rule references), not reproduce flavour text from the book. Player-written descriptions, names, and notes are filled in by the user.
- If/when the project is released publicly, content licensing must be revisited (see `[DESIGNER]` flag in `PLAN_MVP.md`).

### What `src/ref-data/` must never contain

- Verbatim flavour text or descriptions from the TOR 2e book — see the licensing note above.
- Internal review notes — those go to `docs/` or to GitHub issues, not into `src/`.

The shape of `src/ref-data/` itself (file layout, ID conventions, schema versioning, the "adding a new entry" checklist, and the leaf-purity rules that bind it) lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md) under "Reference data conventions".

---

**End of TOR 2e Domain Specification — v1.0**
