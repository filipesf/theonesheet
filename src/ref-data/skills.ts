import type { Skill } from '../domain/types';

export const SKILLS = [
  { id: 'awe',         name: 'Awe',         category: 'STRENGTH' },
  { id: 'athletics',   name: 'Athletics',   category: 'STRENGTH' },
  { id: 'awareness',   name: 'Awareness',   category: 'STRENGTH' },
  { id: 'hunting',     name: 'Hunting',     category: 'STRENGTH' },
  { id: 'song',        name: 'Song',        category: 'STRENGTH' },
  { id: 'craft',       name: 'Craft',       category: 'STRENGTH' },
  { id: 'enhearten',   name: 'Enhearten',   category: 'HEART' },
  { id: 'travel',      name: 'Travel',      category: 'HEART' },
  { id: 'insight',     name: 'Insight',     category: 'HEART' },
  { id: 'healing',     name: 'Healing',     category: 'HEART' },
  { id: 'courtesy',    name: 'Courtesy',    category: 'HEART' },
  { id: 'battle',      name: 'Battle',      category: 'HEART' },
  { id: 'persuade',    name: 'Persuade',    category: 'WITS' },
  { id: 'stealth',     name: 'Stealth',     category: 'WITS' },
  { id: 'scan',        name: 'Scan',        category: 'WITS' },
  { id: 'explore',     name: 'Explore',     category: 'WITS' },
  { id: 'riddle',      name: 'Riddle',      category: 'WITS' },
  { id: 'lore',        name: 'Lore',        category: 'WITS' },
] as const satisfies readonly { id: string; name: string; category: Skill['category'] }[];

export type SkillId = (typeof SKILLS)[number]['id'];

export function createEmptySkills(): Skill[] {
  return SKILLS.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    rating: 0,
    favoured: false,
  }));
}

const SKILL_ID_BY_LEGACY_NAME = new Map<string, SkillId>(
  SKILLS.map((skill) => [skill.name, skill.id]),
);

export function legacyNameToSkillId(value: string): SkillId | null {
  return SKILL_ID_BY_LEGACY_NAME.get(value) ?? null;
}
