import type { Calling, HeroicCulture, StandardOfLiving } from '../domain/types';

/**
 * `ref-data/` is a pure leaf — no UI strings, only stable identifiers and TOR
 * canonical content. Display labels for enums live in the i18n bundle and are
 * resolved by feature code via these helper key builders.
 */

const enumToKey = (value: string): string => value.toLowerCase().replace(/_/g, '-');

export const heroicCultureKey = (culture: HeroicCulture): string =>
  `sheet.heroic-culture.${enumToKey(culture)}`;

export const callingKey = (calling: Calling): string =>
  `sheet.calling.${enumToKey(calling)}`;

export const standardOfLivingKey = (standard: StandardOfLiving): string =>
  `sheet.standard-of-living.${enumToKey(standard)}`;

export type Patron = { id: string; name: string };

export const PATRONS: Patron[] = [
  { id: 'gandalf', name: 'Gandalf the Grey' },
  { id: 'bilbo', name: 'Bilbo Baggins' },
  { id: 'balin', name: 'Balin son of Fundin' },
  { id: 'beorn', name: 'Beorn the Skin-changer' },
  { id: 'bard', name: 'Bard the Bowman' },
  { id: 'dain', name: 'Dáin Ironfoot' },
  { id: 'thranduil', name: 'King Thranduil' },
  { id: 'radagast', name: 'Radagast the Brown' },
];

const PATRONS_BY_ID = new Map(PATRONS.map((patron) => [patron.id, patron]));

export function resolvePatronName(id: string | null | undefined): string {
  if (!id) return '';
  const match = PATRONS_BY_ID.get(id);
  if (match) return match.name;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return '';
  }
  return id;
}
