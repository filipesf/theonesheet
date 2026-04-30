import type { HeroicCulture } from '../domain/types';

export type VirtueEffect =
  | { kind: 'max_endurance_plus'; amount: number }
  | { kind: 'max_hope_plus'; amount: number }
  | { kind: 'base_parry_plus'; amount: number }
  | { kind: 'attribute_tn_minus'; amount: number; attribute: 'strength' | 'heart' | 'wits' | 'choose' }
  | { kind: 'mastery_pick_skills'; count: number }
  | { kind: 'narrative_only' };

export type VirtueEntry = {
  id: string;
  kind: 'standard' | 'cultural';
  parentId: HeroicCulture | null;
  repeatable: boolean;
  prerequisites: { wisdomMin?: number };
  effects: readonly VirtueEffect[];
};

export const VIRTUES = [
  { id: 'confidence',  kind: 'standard', parentId: null, repeatable: true,  prerequisites: {}, effects: [{ kind: 'max_hope_plus', amount: 2 }] },
  { id: 'dour-handed', kind: 'standard', parentId: null, repeatable: true,  prerequisites: {}, effects: [{ kind: 'narrative_only' }] },
  { id: 'hardiness',   kind: 'standard', parentId: null, repeatable: true,  prerequisites: {}, effects: [{ kind: 'max_endurance_plus', amount: 2 }] },
  { id: 'mastery',     kind: 'standard', parentId: null, repeatable: true,  prerequisites: {}, effects: [{ kind: 'mastery_pick_skills', count: 2 }] },
  { id: 'nimbleness',  kind: 'standard', parentId: null, repeatable: true,  prerequisites: {}, effects: [{ kind: 'base_parry_plus', amount: 1 }] },
  { id: 'prowess',     kind: 'standard', parentId: null, repeatable: true,  prerequisites: {}, effects: [{ kind: 'attribute_tn_minus', amount: 1, attribute: 'choose' }] },

  { id: 'baruk-khazad',        kind: 'cultural', parentId: 'DWARVES_OF_DURINS_FOLK', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'path-of-durin',       kind: 'cultural', parentId: 'DWARVES_OF_DURINS_FOLK', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'stiff-necked',        kind: 'cultural', parentId: 'DWARVES_OF_DURINS_FOLK', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'that-which-was-lost', kind: 'cultural', parentId: 'DWARVES_OF_DURINS_FOLK', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'untameable-spirit',   kind: 'cultural', parentId: 'DWARVES_OF_DURINS_FOLK', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'max_hope_plus', amount: 1 }] },
  { id: 'words-of-power',      kind: 'cultural', parentId: 'DWARVES_OF_DURINS_FOLK', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },

  { id: 'bahkdir',                kind: 'cultural', parentId: 'BARDINGS', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'birthright-of-lake-town', kind: 'cultural', parentId: 'BARDINGS', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'cram',                   kind: 'cultural', parentId: 'BARDINGS', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'determined-folk',        kind: 'cultural', parentId: 'BARDINGS', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'dragon-slayer',          kind: 'cultural', parentId: 'BARDINGS', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'tongue-of-many-lands',   kind: 'cultural', parentId: 'BARDINGS', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },

  { id: 'council-of-the-wise',  kind: 'cultural', parentId: 'ELVES_OF_LINDON', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'elbereth-gilthoniel',  kind: 'cultural', parentId: 'ELVES_OF_LINDON', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'max_hope_plus', amount: 1 }] },
  { id: 'elder-days',           kind: 'cultural', parentId: 'ELVES_OF_LINDON', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'elven-grace',          kind: 'cultural', parentId: 'ELVES_OF_LINDON', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'eyes-of-the-eagle',    kind: 'cultural', parentId: 'ELVES_OF_LINDON', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'light-of-aman',        kind: 'cultural', parentId: 'ELVES_OF_LINDON', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },

  { id: 'brave-at-a-pinch',  kind: 'cultural', parentId: 'HOBBITS_OF_THE_SHIRE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'hobbit-sense',      kind: 'cultural', parentId: 'HOBBITS_OF_THE_SHIRE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'old-gaffers-tales', kind: 'cultural', parentId: 'HOBBITS_OF_THE_SHIRE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'small-but-tough',   kind: 'cultural', parentId: 'HOBBITS_OF_THE_SHIRE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'three-is-company',  kind: 'cultural', parentId: 'HOBBITS_OF_THE_SHIRE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'unobtrusive',       kind: 'cultural', parentId: 'HOBBITS_OF_THE_SHIRE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },

  { id: 'bree-pony',                  kind: 'cultural', parentId: 'MEN_OF_BREE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'max_hope_plus', amount: 1 }] },
  { id: 'crafty',                     kind: 'cultural', parentId: 'MEN_OF_BREE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'determined',                 kind: 'cultural', parentId: 'MEN_OF_BREE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'old-bones',                  kind: 'cultural', parentId: 'MEN_OF_BREE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'stout-hearted',              kind: 'cultural', parentId: 'MEN_OF_BREE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'strange-as-news-from-bree',  kind: 'cultural', parentId: 'MEN_OF_BREE', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },

  { id: 'bow-mastery',                 kind: 'cultural', parentId: 'RANGERS_OF_THE_NORTH', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'foresight-of-their-kindred',  kind: 'cultural', parentId: 'RANGERS_OF_THE_NORTH', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'heir-of-arnor',               kind: 'cultural', parentId: 'RANGERS_OF_THE_NORTH', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'hunter-of-the-unseen',        kind: 'cultural', parentId: 'RANGERS_OF_THE_NORTH', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'lore-of-eriador',             kind: 'cultural', parentId: 'RANGERS_OF_THE_NORTH', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
  { id: 'wandering-days',              kind: 'cultural', parentId: 'RANGERS_OF_THE_NORTH', repeatable: false, prerequisites: { wisdomMin: 2 }, effects: [{ kind: 'narrative_only' }] },
] as const satisfies readonly VirtueEntry[];

export type VirtueId = (typeof VIRTUES)[number]['id'];

export const VIRTUES_BY_ID = new Map<string, VirtueEntry>(
  VIRTUES.map((virtue) => [virtue.id, virtue]),
);

const VIRTUE_ID_BY_LEGACY_NAME: Record<string, VirtueId> = {
  Confidence: 'confidence',
  'Dour-Handed': 'dour-handed',
  'Dour-handed': 'dour-handed',
  Hardiness: 'hardiness',
  Mastery: 'mastery',
  Nimbleness: 'nimbleness',
  Prowess: 'prowess',
};

export function legacyNameToVirtueId(value: string): VirtueId | null {
  return VIRTUE_ID_BY_LEGACY_NAME[value] ?? null;
}
