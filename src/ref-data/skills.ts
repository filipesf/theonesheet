import type { Skill } from '../domain/types';

const SKILLS: Array<Pick<Skill, 'name' | 'category'>> = [
  { name: 'Awe', category: 'STRENGTH' },
  { name: 'Athletics', category: 'STRENGTH' },
  { name: 'Awareness', category: 'STRENGTH' },
  { name: 'Hunting', category: 'STRENGTH' },
  { name: 'Song', category: 'STRENGTH' },
  { name: 'Craft', category: 'STRENGTH' },
  { name: 'Enhearten', category: 'HEART' },
  { name: 'Travel', category: 'HEART' },
  { name: 'Insight', category: 'HEART' },
  { name: 'Healing', category: 'HEART' },
  { name: 'Courtesy', category: 'HEART' },
  { name: 'Battle', category: 'HEART' },
  { name: 'Persuade', category: 'WITS' },
  { name: 'Stealth', category: 'WITS' },
  { name: 'Scan', category: 'WITS' },
  { name: 'Explore', category: 'WITS' },
  { name: 'Riddle', category: 'WITS' },
  { name: 'Lore', category: 'WITS' },
];

export function createEmptySkills(): Skill[] {
  return SKILLS.map((skill) => ({ ...skill, rating: 0, favoured: false }));
}
