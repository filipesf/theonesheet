import { validateCreation, type CreationIssue } from '../../domain/creation';
import type { Character } from '../../domain/types';

export type CreationValidationSummary = {
  blocking: CreationIssue[];
  draftWarnings: CreationIssue[];
  canFinalise: boolean;
};

export function getCreationValidationSummary(character: Character): CreationValidationSummary {
  const issues = validateCreation(character);
  const blocking = issues.filter((issue) => issue.blocking);
  const draftWarnings = issues.filter((issue) => !issue.blocking);

  return {
    blocking,
    draftWarnings,
    canFinalise: blocking.length === 0,
  };
}
