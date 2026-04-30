export const PATRON_IDS = [
  'gandalf',
  'bilbo',
  'balin',
  'beorn',
  'bard',
  'dain',
  'thranduil',
  'radagast',
] as const;

export type PatronId = (typeof PATRON_IDS)[number];

export type PatronEntry = { id: PatronId; fallbackName: string };

export const PATRONS: PatronEntry[] = [
  { id: 'gandalf',   fallbackName: 'Gandalf the Grey' },
  { id: 'bilbo',     fallbackName: 'Bilbo Baggins' },
  { id: 'balin',     fallbackName: 'Balin son of Fundin' },
  { id: 'beorn',     fallbackName: 'Beorn the Skin-changer' },
  { id: 'bard',      fallbackName: 'Bard the Bowman' },
  { id: 'dain',      fallbackName: 'Dáin Ironfoot' },
  { id: 'thranduil', fallbackName: 'King Thranduil' },
  { id: 'radagast',  fallbackName: 'Radagast the Brown' },
];

const PATRON_BY_ID = new Map(PATRONS.map((patron) => [patron.id as string, patron]));

export function isPatronId(value: string): value is PatronId {
  return PATRON_BY_ID.has(value);
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
