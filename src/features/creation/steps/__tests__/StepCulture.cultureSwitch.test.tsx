import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import '../../../../app/i18n';
import { createEmptyCombatProficiencies } from '../../../../ref-data/proficiencies';
import { createEmptySkills } from '../../../../ref-data/skills';
import type { CreationDraft } from '../../creationSchema';
import { StepCulture } from '../StepCulture';

function makeDefaults(): CreationDraft {
  return {
    heroic_culture: 'HOBBITS_OF_THE_SHIRE',
    cultural_blessing_choice: null,
    underlined_skill_pick: 'stealth',
    attribute_set_index: 4,
    strength: 4,
    heart: 5,
    wits: 5,
    skills: createEmptySkills().map((s) => ({
      id: s.id,
      name: s.name,
      rating: s.rating,
      favoured: s.favoured,
    })),
    combat_proficiencies: createEmptyCombatProficiencies().map((p) => ({
      name: p.name,
      rating: p.rating,
    })),
    cultural_features: ['inquisitive', 'keen-eyed'],
    name: 'Belba',
    age: 28,
    calling: 'TREASURE_HUNTER',
    calling_feature: 'burglary',
    starting_reward: 'keen',
    starting_reward_target: '',
    starting_virtue: 'mastery',
    starting_virtue_selection: {
      kind: 'mastery',
      skill_ids: ['explore', 'healing'],
    },
    standard_of_living: 'COMMON',
    weapons: [],
    armour: null,
    shield: null,
    patron_id: '',
    safe_haven: '',
  };
}

function StateProbe() {
  const attributeSetIndex = useWatch<CreationDraft>({ name: 'attribute_set_index' });
  const strength = useWatch<CreationDraft>({ name: 'strength' });
  const heart = useWatch<CreationDraft>({ name: 'heart' });
  const wits = useWatch<CreationDraft>({ name: 'wits' });
  const culturalFeatures = useWatch<CreationDraft>({ name: 'cultural_features' });
  return (
    <output data-testid="state-json">
      {JSON.stringify({ attributeSetIndex, strength, heart, wits, culturalFeatures })}
    </output>
  );
}

function Harness({ children }: { children: ReactNode }) {
  const methods = useForm<CreationDraft>({ defaultValues: makeDefaults() });
  return (
    <FormProvider {...methods}>
      {children}
      <StateProbe />
    </FormProvider>
  );
}

describe('StepCulture · culture switch', () => {
  it('resets culture-bound state when the user picks a different culture', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <StepCulture />
      </Harness>,
    );

    // Sanity: the initial Hobbit state is loaded.
    const probe = screen.getByTestId('state-json');
    expect(probe.textContent).toContain('"attributeSetIndex":4');
    expect(probe.textContent).toContain('"strength":4');
    expect(probe.textContent).toContain('"culturalFeatures":["inquisitive","keen-eyed"]');

    // Switch to Dwarves of Durin's Folk.
    await user.click(screen.getByRole('button', { name: /Anão do Povo de Durin/i }));

    // attribute_set_index, attribute rolls, and cultural_features must
    // reset — they are scoped to the previous culture and would describe
    // a forbidden mix if left intact.
    expect(probe.textContent).toContain('"attributeSetIndex":-1');
    expect(probe.textContent).toContain('"strength":0');
    expect(probe.textContent).toContain('"heart":0');
    expect(probe.textContent).toContain('"wits":0');
    expect(probe.textContent).toContain('"culturalFeatures":[]');
  });

  it('does not reset attribute or feature state when the active culture is re-clicked', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <StepCulture />
      </Harness>,
    );

    const probe = screen.getByTestId('state-json');
    await user.click(screen.getByRole('button', { name: /Hobbit do Condado/i }));

    expect(probe.textContent).toContain('"attributeSetIndex":4');
    expect(probe.textContent).toContain('"strength":4');
    expect(probe.textContent).toContain('"culturalFeatures":["inquisitive","keen-eyed"]');
  });
});
