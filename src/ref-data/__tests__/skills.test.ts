import { describe, expect, it } from 'vitest';
import { SKILLS, createEmptySkills, legacyNameToSkillId } from '../skills';

const VALID_CATEGORIES = new Set(['STRENGTH', 'HEART', 'WITS']);

describe('SKILLS ref-data', () => {
  it('ships exactly 18 skills', () => {
    expect(SKILLS).toHaveLength(18);
  });

  it('every id is unique kebab-case', () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z][a-z-]*$/);
    }
  });

  it('every category is one of STRENGTH | HEART | WITS', () => {
    for (const skill of SKILLS) {
      expect(VALID_CATEGORIES.has(skill.category)).toBe(true);
    }
  });

  it('legacy names round-trip to canonical ids', () => {
    for (const skill of SKILLS) {
      expect(legacyNameToSkillId(skill.name)).toBe(skill.id);
    }
    expect(legacyNameToSkillId('Unknown')).toBeNull();
  });

  it('createEmptySkills stamps id, rating 0 and favoured false', () => {
    const empties = createEmptySkills();
    for (const skill of empties) {
      expect(skill.id).toBeDefined();
      expect(skill.rating).toBe(0);
      expect(skill.favoured).toBe(false);
    }
  });
});
