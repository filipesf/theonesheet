import type { Calling, HeroicCulture, StandardOfLiving } from '../domain/types';

export const HEROIC_CULTURE_LABELS: Record<HeroicCulture, string> = {
  DWARVES_OF_DURINS_FOLK: "Dwarf of Durin's Folk",
  BARDINGS: 'Barding',
  ELVES_OF_LINDON: 'Elf of Lindon',
  HOBBITS_OF_THE_SHIRE: 'Hobbit of the Shire',
  MEN_OF_BREE: 'Man of Bree',
  RANGERS_OF_THE_NORTH: 'Ranger of the North',
};

export const CALLING_LABELS: Record<Calling, string> = {
  CAPTAIN: 'Captain',
  CHAMPION: 'Champion',
  MESSENGER: 'Messenger',
  SCHOLAR: 'Scholar',
  TREASURE_HUNTER: 'Treasure Hunter',
  WARDEN: 'Warden',
};

export const STANDARD_OF_LIVING_LABELS: Record<StandardOfLiving, string> = {
  POOR: 'Poor',
  FRUGAL: 'Frugal',
  COMMON: 'Common',
  PROSPEROUS: 'Prosperous',
  RICH: 'Rich',
  VERY_RICH: 'Very Rich',
};

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
  // Fallback: never expose UUIDs to users.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return '';
  }
  return id;
}
