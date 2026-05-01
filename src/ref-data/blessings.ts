import type { HeroicCulture } from '../domain/types';

/**
 * Cultural Blessings (TOR 2e). Each blessing carries one or more mechanical
 * effects; some are pure flavour (`narrative-only`), others wire into derived
 * stats and runtime mechanics. Effects are deliberately structured so the
 * derivation layer can pattern-match without depending on display strings.
 *
 * Effects whose runtime mechanics live outside character creation
 * (`favoured-rolls`, `hope-magic-success`, `shadow-resist-bonus`,
 * `company-society-plus`, `fellowship-hope-recovery-cap`) are recorded as
 * data only in v0; their wiring is deferred to play-runtime work.
 */

export type BlessingEffect =
  | { kind: 'load-halve-armour-helm' }
  | { kind: 'favoured-rolls'; scope: 'valour' | 'wisdom' }
  | { kind: 'hope-magic-success' }
  | { kind: 'shadow-resist-bonus'; against: 'greed' | 'all'; dice: number }
  | { kind: 'company-society-plus'; per: 'character' }
  | {
      kind: 'attribute-plus';
      amount: number;
      attribute: 'choose' | 'strength' | 'heart' | 'wits';
    }
  | { kind: 'fellowship-hope-recovery-cap'; formula: 'half-heart-ceil' }
  | { kind: 'narrative-only' };

export type BlessingEntry = {
  id: string;
  effects: readonly BlessingEffect[];
};

export const BLESSINGS = [
  {
    id: 'redoubtable',
    effects: [{ kind: 'load-halve-armour-helm' }],
  },
  {
    id: 'stout-hearted',
    effects: [{ kind: 'favoured-rolls', scope: 'valour' }],
  },
  {
    id: 'elven-skill',
    effects: [{ kind: 'hope-magic-success' }],
  },
  {
    id: 'hobbit-sense',
    effects: [
      { kind: 'favoured-rolls', scope: 'wisdom' },
      { kind: 'shadow-resist-bonus', against: 'greed', dice: 1 },
    ],
  },
  {
    // Bree-blood: Society level wiring lives at the Company layer (out of v0
    // scope). The data record exists; runtime wiring is deferred.
    id: 'bree-blood',
    effects: [{ kind: 'company-society-plus', per: 'character' }],
  },
  {
    // Rangers carry both Kings of Men (+1 to a chosen attribute) and the
    // Dúnedain Fidelity restriction on Fellowship-phase Hope recovery. The
    // recovery cap is recorded for v0 but wired only at play-runtime.
    id: 'kings-of-men',
    effects: [
      { kind: 'attribute-plus', amount: 1, attribute: 'choose' },
      { kind: 'fellowship-hope-recovery-cap', formula: 'half-heart-ceil' },
    ],
  },
] as const satisfies readonly BlessingEntry[];

export type BlessingId = (typeof BLESSINGS)[number]['id'];

export const BLESSINGS_BY_ID = new Map<string, BlessingEntry>(
  BLESSINGS.map((blessing) => [blessing.id, blessing]),
);

export const BLESSING_BY_CULTURE: Record<HeroicCulture, BlessingId> = {
  DWARVES_OF_DURINS_FOLK: 'redoubtable',
  BARDINGS: 'stout-hearted',
  ELVES_OF_LINDON: 'elven-skill',
  HOBBITS_OF_THE_SHIRE: 'hobbit-sense',
  MEN_OF_BREE: 'bree-blood',
  RANGERS_OF_THE_NORTH: 'kings-of-men',
};

const BLESSING_ID_BY_LEGACY_NAME: Record<string, BlessingId> = {
  Redoubtable: 'redoubtable',
  'Stout-Hearted': 'stout-hearted',
  'Elven-Skill': 'elven-skill',
  'Hobbit-Sense': 'hobbit-sense',
  'Bree-Blood': 'bree-blood',
  'Kings of Men': 'kings-of-men',
};

export function legacyNameToBlessingId(value: string): BlessingId | null {
  return BLESSING_ID_BY_LEGACY_NAME[value] ?? null;
}
