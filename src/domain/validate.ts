import type { Character } from './types';

export type ValidationIssue = {
  field: string;
  message: string;
};

export function validateCharacter(character: Character): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (character.valour < 1 || character.valour > 6) {
    issues.push({ field: 'valour', message: 'Valour must be in range 1..6.' });
  }

  if (character.wisdom < 1 || character.wisdom > 6) {
    issues.push({ field: 'wisdom', message: 'Wisdom must be in range 1..6.' });
  }

  if (character.load < 0 || character.load > character.max_endurance) {
    issues.push({ field: 'load', message: 'Load must be >= 0 and <= max endurance.' });
  }

  if (character.current_endurance < 0 || character.current_endurance > character.max_endurance) {
    issues.push({
      field: 'current_endurance',
      message: 'Current endurance must be in range 0..max_endurance.',
    });
  }

  if (character.current_hope < 0 || character.current_hope > character.max_hope) {
    issues.push({
      field: 'current_hope',
      message: 'Current hope must be in range 0..max_hope.',
    });
  }

  if (character.shadow < 0) {
    issues.push({ field: 'shadow', message: 'Shadow cannot be negative.' });
  }

  return issues;
}
