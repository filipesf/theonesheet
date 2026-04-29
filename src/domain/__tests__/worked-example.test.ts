import { describe, expect, it } from 'vitest';
import { createBelbaWorkedExample } from '../schema';

describe('Belba worked example', () => {
  it('matches PRD-derived totals for key fields', () => {
    const belba = createBelbaWorkedExample();

    expect(belba.name).toBe('Belba Bolger');
    expect(belba.attributes.tn_strength).toBe(16);
    expect(belba.attributes.tn_heart).toBe(15);
    expect(belba.attributes.tn_wits).toBe(15);
    expect(belba.max_endurance).toBe(24);
    expect(belba.max_hope).toBe(15);
    expect(belba.base_parry).toBe(17);
    expect(belba.load).toBe(7);
    expect(belba.current_endurance).toBe(24);
    expect(belba.current_hope).toBe(15);
  });
});
