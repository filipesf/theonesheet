import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import '../../../../app/i18n';
import { createEmptyCombatProficiencies } from '../../../../ref-data/proficiencies';
import { createEmptySkills } from '../../../../ref-data/skills';
import type { CreationDraft } from '../../creationSchema';
import { StepCalling } from '../StepCalling';

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
    starting_virtue_selection: null,
    standard_of_living: 'COMMON',
    weapons: [],
    armour: null,
    shield: null,
    patron_id: '',
    safe_haven: '',
  };
}

function SelectionProbe() {
  const selection = useWatch<CreationDraft>({ name: 'starting_virtue_selection' });
  return <output data-testid="selection-json">{JSON.stringify(selection)}</output>;
}

function Harness({ children }: { children: ReactNode }) {
  const methods = useForm<CreationDraft>({ defaultValues: makeDefaults() });
  return (
    <FormProvider {...methods}>
      {children}
      <SelectionProbe />
    </FormProvider>
  );
}

function masterySection(): HTMLElement {
  // Scope queries to the mastery picker block — other parts of StepCalling
  // also render buttons (callings, calling features, equipment) and a
  // generic getByRole would collide.
  const heading = screen.getByRole('heading', { name: /Perícias da Mestria/i });
  return heading.parentElement as HTMLElement;
}

describe('StepCalling · mastery skill picker', () => {
  it('persists a 2-skill mastery selection after two clicks', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <StepCalling />
      </Harness>,
    );

    const section = masterySection();
    const explore = within(section).getByRole('button', { name: /Exploração/i });
    const healing = within(section).getByRole('button', { name: /Cura/i });

    expect(explore).toHaveAttribute('aria-pressed', 'false');
    expect(healing).toHaveAttribute('aria-pressed', 'false');

    await user.click(explore);
    // After the first click the chosen skill must already appear pressed —
    // the picker must NOT silently drop the in-progress selection.
    expect(explore).toHaveAttribute('aria-pressed', 'true');

    await user.click(healing);
    expect(explore).toHaveAttribute('aria-pressed', 'true');
    expect(healing).toHaveAttribute('aria-pressed', 'true');

    const probe = screen.getByTestId('selection-json');
    expect(probe.textContent).toContain('"kind":"mastery"');
    expect(probe.textContent).toContain('"explore"');
    expect(probe.textContent).toContain('"healing"');
  });

  it('toggles a previously selected mastery skill off when clicked again', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <StepCalling />
      </Harness>,
    );

    const section = masterySection();
    const explore = within(section).getByRole('button', { name: /Exploração/i });
    await user.click(explore);
    expect(explore).toHaveAttribute('aria-pressed', 'true');

    await user.click(explore);
    expect(explore).toHaveAttribute('aria-pressed', 'false');
  });
});
