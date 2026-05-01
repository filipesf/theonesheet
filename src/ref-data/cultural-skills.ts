import type { HeroicCulture } from '../domain/types';
import type { SkillId } from './skills';

/**
 * The two underlined skills per culture in the TOR 2e basic rulebook
 * (`docs/THE_ONE_RING_BASIC_RULES.md`). At creation the player must mark
 * exactly one of the pair as Favoured.
 *
 * The source markdown loses the underline formatting from the original PDF;
 * the values below match the canonical TOR 2e Free League core rules. Should
 * an errata adjust them, change them here only — the wizard, validation, and
 * tests pivot on this single source of truth.
 */
export const CULTURAL_UNDERLINED_SKILLS: Record<
  HeroicCulture,
  readonly [SkillId, SkillId]
> = {
  DWARVES_OF_DURINS_FOLK: ['awe', 'battle'],
  BARDINGS: ['awe', 'enhearten'],
  ELVES_OF_LINDON: ['stealth', 'lore'],
  HOBBITS_OF_THE_SHIRE: ['stealth', 'riddle'],
  MEN_OF_BREE: ['insight', 'riddle'],
  RANGERS_OF_THE_NORTH: ['hunting', 'battle'],
} as const;
