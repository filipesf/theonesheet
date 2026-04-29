import { describe, expect, it } from 'vitest';
import { createBelbaWorkedExample, createEmptyCharacter } from '../../../domain/schema';
import { getCreationValidationSummary } from '../validation';

describe('creation validation summary', () => {
  it('allows worked example to finalise', () => {
    const summary = getCreationValidationSummary(createBelbaWorkedExample());
    expect(summary.canFinalise).toBe(true);
    expect(summary.blocking).toHaveLength(0);
  });

  it('marks incomplete draft as blocked and warns on partial spending', () => {
    const draft = createEmptyCharacter();
    const summary = getCreationValidationSummary(draft);

    expect(summary.canFinalise).toBe(false);
    expect(summary.blocking.length).toBeGreaterThan(0);
    expect(summary.draftWarnings.some((item) => item.includes('partially spent'))).toBe(true);
  });
});
