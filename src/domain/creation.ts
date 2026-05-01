import { CULTURAL_UNDERLINED_SKILLS } from '../ref-data/cultural-skills';
import type { Character, SkillId } from './types';

export type CreationIssueCode =
  | 'name-required'
  | 'age-positive'
  | 'distinctive-features-min'
  | 'rewards-one'
  | 'virtues-one'
  | 'previous-experience-overspent'
  | 'previous-experience-underspent'
  | 'derived-state-bounds'
  | 'mastery-selection-required'
  | 'mastery-skills-distinct'
  | 'prowess-selection-required'
  | 'rangers-attribute-choice-required'
  | 'underlined-skill-required';

export type CreationIssue = {
  field: string;
  code: CreationIssueCode;
  data?: Record<string, string | number>;
  blocking: boolean;
};

const SKILL_COST_BY_TARGET: Record<number, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
};

const PROFICIENCY_COST_BY_TARGET: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6,
};

function skillCostToRating(rating: number): number {
  let total = 0;
  for (let next = 1; next <= rating; next += 1) {
    total += SKILL_COST_BY_TARGET[next] ?? 0;
  }
  return total;
}

function proficiencyCostToRating(rating: number): number {
  let total = 0;
  for (let next = 1; next <= rating; next += 1) {
    total += PROFICIENCY_COST_BY_TARGET[next] ?? 0;
  }
  return total;
}

export function estimatePreviousExperienceSpent(character: Character): number {
  const skillPoints = character.skills.reduce((sum, skill) => sum + skillCostToRating(skill.rating), 0);
  const proficiencyPoints = character.combat_proficiencies.reduce(
    (sum, proficiency) => sum + proficiencyCostToRating(proficiency.rating),
    0,
  );
  return skillPoints + proficiencyPoints;
}

export function validateCreation(character: Character): CreationIssue[] {
  const issues: CreationIssue[] = [];
  const spent =
    character.experience.total_skill_points_spent + character.experience.total_adventure_points_spent > 0
      ? character.experience.total_skill_points_spent + character.experience.total_adventure_points_spent
      : estimatePreviousExperienceSpent(character);

  if (!character.name.trim()) {
    issues.push({ field: 'name', code: 'name-required', blocking: true });
  }

  if (character.age <= 0) {
    issues.push({ field: 'age', code: 'age-positive', blocking: true });
  }

  if (character.distinctive_features.length < 3) {
    issues.push({ field: 'distinctive_features', code: 'distinctive-features-min', blocking: true });
  }

  if (character.rewards.length !== 1) {
    issues.push({ field: 'rewards', code: 'rewards-one', blocking: true });
  }

  if (character.virtues.length !== 1) {
    issues.push({ field: 'virtues', code: 'virtues-one', blocking: true });
  }

  if (spent > 10) {
    issues.push({
      field: 'previous_experience',
      code: 'previous-experience-overspent',
      data: { spent },
      blocking: true,
    });
  }

  if (spent < 10) {
    issues.push({
      field: 'previous_experience',
      code: 'previous-experience-underspent',
      data: { spent },
      blocking: false,
    });
  }

  if (character.current_endurance > character.max_endurance || character.current_hope > character.max_hope) {
    issues.push({ field: 'derived_state', code: 'derived-state-bounds', blocking: true });
  }

  // Cultural underlined skill: exactly one of the pair must be Favoured.
  const underlinedPair = CULTURAL_UNDERLINED_SKILLS[character.heroic_culture];
  const favouredFromPair = character.skills.filter(
    (skill): skill is typeof skill & { id: SkillId } =>
      skill.favoured && !!skill.id && (underlinedPair as readonly SkillId[]).includes(skill.id as SkillId),
  );
  if (favouredFromPair.length === 0) {
    issues.push({
      field: 'underlined_skill',
      code: 'underlined-skill-required',
      blocking: true,
    });
  }

  // Rangers blessing: an attribute choice is required.
  if (character.heroic_culture === 'RANGERS_OF_THE_NORTH') {
    if (character.cultural_blessing_choice?.kind !== 'attribute-plus') {
      issues.push({
        field: 'cultural_blessing_choice',
        code: 'rangers-attribute-choice-required',
        blocking: true,
      });
    }
  }

  // Virtue selection invariants for starting Mastery / Prowess.
  for (const virtue of character.virtues) {
    if (virtue.id === 'mastery') {
      if (virtue.selection?.kind !== 'mastery') {
        issues.push({
          field: 'starting_virtue_selection',
          code: 'mastery-selection-required',
          blocking: true,
        });
      } else {
        const [a, b] = virtue.selection.skill_ids;
        if (a === b) {
          issues.push({
            field: 'starting_virtue_selection',
            code: 'mastery-skills-distinct',
            blocking: true,
          });
        }
      }
    }
    if (virtue.id === 'prowess' && virtue.selection?.kind !== 'prowess') {
      issues.push({
        field: 'starting_virtue_selection',
        code: 'prowess-selection-required',
        blocking: true,
      });
    }
  }

  return issues;
}
