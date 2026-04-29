import type { Character } from '../../domain/types';
import { validateCreation } from '../../domain/creation';

export function getCreationValidationSummary(character: Character): {
  blocking: string[];
  draftWarnings: string[];
  canFinalise: boolean;
} {
  const issues = validateCreation(character);
  const blocking = issues.filter((issue) => issue.blocking).map((issue) => `${issue.field}: ${issue.message}`);
  const draftWarnings = issues
    .filter((issue) => !issue.blocking)
    .map((issue) => `${issue.field}: ${issue.message}`);

  return {
    blocking,
    draftWarnings,
    canFinalise: blocking.length === 0,
  };
}
