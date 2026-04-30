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
