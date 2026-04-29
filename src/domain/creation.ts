import type { Character } from './types';

export type CreationIssue = {
  field: string;
  message: string;
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
    issues.push({ field: 'name', message: 'Name is required to finalise the hero.', blocking: true });
  }

  if (character.age <= 0) {
    issues.push({ field: 'age', message: 'Age should be greater than zero.', blocking: true });
  }

  if (character.distinctive_features.length < 3) {
    issues.push({
      field: 'distinctive_features',
      message: 'At least 3 distinctive features are expected (2 culture + 1 calling).',
      blocking: true,
    });
  }

  if (character.rewards.length !== 1) {
    issues.push({ field: 'rewards', message: 'Pick exactly one starting reward.', blocking: true });
  }

  if (character.virtues.length !== 1) {
    issues.push({ field: 'virtues', message: 'Pick exactly one starting virtue.', blocking: true });
  }

  if (spent > 10) {
    issues.push({
      field: 'previous_experience',
      message: `Previous Experience overspent: ${spent}/10.`,
      blocking: true,
    });
  }

  if (spent < 10) {
    issues.push({
      field: 'previous_experience',
      message: `Previous Experience partially spent: ${spent}/10.`,
      blocking: false,
    });
  }

  if (character.current_endurance > character.max_endurance || character.current_hope > character.max_hope) {
    issues.push({
      field: 'derived_state',
      message: 'Current endurance/hope should not exceed max values.',
      blocking: true,
    });
  }

  return issues;
}
