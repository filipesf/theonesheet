import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { estimatePreviousExperienceSpent } from '../../../domain/creation';
import type { Character } from '../../../domain/types';
import { createEmptySkills } from '../../../ref-data/skills';
import { ExperienceMeter } from '../components/ExperienceMeter';
import type { CreationDraft } from '../creationSchema';

const CATEGORY_BY_NAME: Record<string, 'STRENGTH' | 'HEART' | 'WITS'> = Object.fromEntries(
  createEmptySkills().map((skill) => [skill.name, skill.category]),
);

function skillLabel(t: (key: string) => string, skill: { id?: string; name: string }): string {
  return skill.id ? t(`ref.skills.${skill.id}`) : skill.name;
}

export function StepSkills() {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<CreationDraft>();
  const { fields } = useFieldArray({ control, name: 'skills' });
  const skills = useWatch({ control, name: 'skills' });
  const proficiencies = useWatch({ control, name: 'combat_proficiencies' });

  const spent = estimatePreviousExperienceSpent({
    skills,
    combat_proficiencies: proficiencies,
  } as unknown as Character);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-display text-ink-navy">
            {t('creation.step.skills.title')}
          </h2>
          <p className="font-body text-base text-ink-navy/70 mt-1">
            {t('creation.step.skills.body')}
          </p>
        </div>
        <ExperienceMeter spent={spent} budget={10} />
      </header>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {fields.map((field, index) => {
          const skill = skills[index]!;
          return (
            <li
              key={field.id}
              className="grid grid-cols-[18px_minmax(0,1fr)_72px_36px] items-center gap-2 border-b border-ink-red/20 py-1"
            >
              <input
                type="checkbox"
                checked={skill.favoured}
                onChange={(event) =>
                  setValue(`skills.${index}.favoured`, event.target.checked, { shouldDirty: true })
                }
                aria-label={t('creation.step.skills.favoured-label', { name: skillLabel(t, skill) })}
                className="accent-ink-red"
              />
              <span className="font-body text-base text-ink-navy truncate">{skillLabel(t, skill)}</span>
              <input
                type="number"
                min={0}
                max={6}
                value={skill.rating}
                onChange={(event) =>
                  setValue(
                    `skills.${index}.rating`,
                    Math.max(0, Math.min(6, Number(event.target.value) || 0)),
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
                aria-label={t('creation.step.skills.rating-label', { name: skillLabel(t, skill) })}
                className="bg-transparent border border-ink-red/40 px-2 py-1 text-center font-hand text-lg text-ink-navy"
              />
              <span className="font-label text-microcaption tracking-section uppercase text-ink-red/70 text-right">
                {t(`creation.step.skills.category.${CATEGORY_BY_NAME[skill.name]?.toLowerCase() ?? 'strength'}`)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
