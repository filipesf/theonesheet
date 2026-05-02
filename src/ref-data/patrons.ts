import type { Calling } from '../domain/types';

export const PATRON_IDS = [
  'balin',
  'bilbo',
  'cirdan',
  'gandalf',
  'gilraen',
  'tom-and-goldberry',
] as const;

export type PatronId = (typeof PATRON_IDS)[number];

export type PatronEntry = {
  id: PatronId;
  fallbackName: string;
  fellowshipBonus: 0 | 1 | 2;
  favouredCallings: readonly Calling[];
};

export const PATRONS: readonly PatronEntry[] = [
  {
    id: 'balin',
    fallbackName: 'Balin, son of Fundin',
    fellowshipBonus: 1,
    favouredCallings: ['CAPTAIN', 'CHAMPION'],
  },
  {
    id: 'bilbo',
    fallbackName: 'Bilbo Baggins',
    fellowshipBonus: 2,
    favouredCallings: ['TREASURE_HUNTER', 'SCHOLAR'],
  },
  {
    id: 'cirdan',
    fallbackName: 'Círdan the Shipwright',
    fellowshipBonus: 1,
    favouredCallings: ['MESSENGER', 'SCHOLAR'],
  },
  {
    id: 'gandalf',
    fallbackName: 'Gandalf the Grey',
    fellowshipBonus: 2,
    favouredCallings: ['MESSENGER', 'CAPTAIN'],
  },
  {
    id: 'gilraen',
    fallbackName: 'Gilraen the Fair',
    fellowshipBonus: 0,
    favouredCallings: ['CHAMPION', 'WARDEN'],
  },
  {
    id: 'tom-and-goldberry',
    fallbackName: 'Tom Bombadil & Goldberry',
    fellowshipBonus: 2,
    favouredCallings: ['WARDEN', 'TREASURE_HUNTER'],
  },
] as const satisfies readonly PatronEntry[];

const PATRON_BY_ID = new Map<string, PatronEntry>(PATRONS.map((patron) => [patron.id, patron]));

const PATRON_LEGACY_NAME_TO_ID: Record<string, PatronId> = {
  Gandalf: 'gandalf',
  'Gandalf the Grey': 'gandalf',
  Bilbo: 'bilbo',
  'Bilbo Baggins': 'bilbo',
  Balin: 'balin',
  'Balin son of Fundin': 'balin',
  'Balin, son of Fundin': 'balin',
  Cirdan: 'cirdan',
  'Círdan': 'cirdan',
  'Círdan the Shipwright': 'cirdan',
  Gilraen: 'gilraen',
  'Gilraen the Fair': 'gilraen',
  Tom: 'tom-and-goldberry',
  'Tom Bombadil': 'tom-and-goldberry',
  'Tom Bombadil & Goldberry': 'tom-and-goldberry',
};

export function isPatronId(value: string): value is PatronId {
  return PATRON_BY_ID.has(value);
}

export function legacyNameToPatronId(value: string): PatronId | null {
  return PATRON_LEGACY_NAME_TO_ID[value] ?? null;
}

export function patronEntry(id: string): PatronEntry | null {
  return PATRON_BY_ID.get(id) ?? null;
}

export function patronFallbackName(value: string | null | undefined): string {
  if (!value) return '';
  const match = PATRON_BY_ID.get(value);
  if (match) return match.fallbackName;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return '';
  }
  return value;
}
