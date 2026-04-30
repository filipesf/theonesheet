// TOR-DATA-GAP: full PRD §6/§7 distinctive feature lists per culture and calling.
// v0 stub: a minimal six-feature pool per culture/calling so the wizard can flow.

import type { Calling, HeroicCulture } from '../../../domain/types';

export const CULTURE_FEATURES: Record<HeroicCulture, string[]> = {
  DWARVES_OF_DURINS_FOLK: ['Bold', 'Grim', 'Proud', 'Robust', 'Stern', 'Trusty'],
  BARDINGS: ['Cunning', 'Fair-spoken', 'Generous', 'Lordly', 'Patient', 'Tall'],
  ELVES_OF_LINDON: ['Curious', 'Eloquent', 'Fair', 'Lordly', 'Mirthful', 'Wise'],
  HOBBITS_OF_THE_SHIRE: ['Cheerful', 'Curious', 'Hospitable', 'Merry', 'Patient', 'Quiet'],
  MEN_OF_BREE: ['Bluff', 'Cautious', 'Honest', 'Steadfast', 'Stout', 'Trusty'],
  RANGERS_OF_THE_NORTH: ['Fair-spoken', 'Grim', 'Just', 'Patient', 'Vigilant', 'Wise'],
};

export const CALLING_FEATURES: Record<Calling, string[]> = {
  CAPTAIN: ['Inspiring', 'Lordly', 'Stern'],
  CHAMPION: ['Bold', 'Fierce', 'Proud'],
  MESSENGER: ['Adventurous', 'Hospitable', 'Quick of Hearing'],
  SCHOLAR: ['Curious', 'Lore-master', 'Wise'],
  TREASURE_HUNTER: ['Cunning', 'Inquisitive', 'Quick'],
  WARDEN: ['Stern', 'Vigilant', 'Wise'],
};
