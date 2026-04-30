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

  it('backfills canonical IDs onto Belba\'s legacy strings', () => {
    const belba = createBelbaWorkedExample();

    expect(belba.rewards[0]?.id).toBe('hardiness');
    expect(belba.virtues[0]?.id).toBe('mastery');
    expect(belba.war_gear.weapons[0]?.id).toBe('sword');
    expect(belba.war_gear.weapons[1]?.id).toBe('bow');
    expect(belba.war_gear.armour?.id).toBe('leather-shirt');
    expect(belba.shadow_path).toBe('dragon-sickness');

    const stealth = belba.skills.find((skill) => skill.id === 'stealth');
    expect(stealth?.rating).toBe(4);
    expect(stealth?.favoured).toBe(true);
    expect(belba.skills.find((s) => s.id === 'persuade')?.favoured).toBe(true);
  });
});
