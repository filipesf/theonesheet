import { describe, expect, it } from 'vitest';
import { classifyFeat, evaluate, type RollRequest, type SuccessFace } from '../diceMechanics';

function req(overrides: Partial<RollRequest> = {}): RollRequest {
  return {
    label: 'Test',
    successDice: 3,
    tn: 14,
    weary: false,
    miserable: false,
    characterId: null,
    ...overrides,
  };
}

describe('classifyFeat', () => {
  it('maps 11 to Gandalf and 12 to Eye', () => {
    expect(classifyFeat(11)).toBe('gandalf');
    expect(classifyFeat(12)).toBe('eye');
    expect(classifyFeat(7)).toBe(7);
  });
});

describe('evaluate', () => {
  it('classifies a TN-passing roll as success', () => {
    const result = evaluate(req(), 8, [4, 5, 1] as SuccessFace[]);
    expect(result.outcome).toBe('success');
    expect(result.total).toBe(18);
  });

  it('classifies failure when total is below TN', () => {
    expect(evaluate(req(), 2, [1, 2, 1] as SuccessFace[]).outcome).toBe('failure');
  });

  it('treats two tengwar (sixes) as a great success when TN passes', () => {
    expect(evaluate(req(), 5, [6, 6, 1] as SuccessFace[]).outcome).toBe('great');
  });

  it('treats three tengwar as extraordinary success when TN passes', () => {
    expect(evaluate(req(), 5, [6, 6, 6] as SuccessFace[]).outcome).toBe('extraordinary');
  });

  it('returns magical when Gandalf shows up and TN passes without 2+ tengwar', () => {
    expect(evaluate(req(), 'gandalf', [4, 5, 1] as SuccessFace[]).outcome).toBe('magical');
  });

  it('downgrades success die faces 1–3 to 0 when weary', () => {
    const result = evaluate(req({ weary: true }), 8, [3, 5, 6] as SuccessFace[]);
    expect(result.total).toBe(8 + 0 + 5 + 6);
    expect(result.successes).toBe(1);
  });

  it('returns auto-fail when miserable and Eye shows up', () => {
    expect(evaluate(req({ miserable: true }), 'eye', [6, 6, 6] as SuccessFace[]).outcome).toBe(
      'auto-fail',
    );
  });

  it('returns no-tn when TN is null', () => {
    expect(evaluate(req({ tn: null }), 4, [4] as SuccessFace[]).outcome).toBe('no-tn');
  });
});
