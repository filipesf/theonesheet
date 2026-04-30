import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { sanitiseDigits } from '../../../app/ui/numeric-input';
import { estimatePreviousExperienceSpent } from '../../../domain/creation';
import type { Character } from '../../../domain/types';
import { ExperienceMeter } from '../components/ExperienceMeter';
import type { CreationDraft } from '../creationSchema';

const PROFICIENCY_KEY: Record<'AXES' | 'BOWS' | 'SPEARS' | 'SWORDS', string> = {
  AXES: 'axes',
  BOWS: 'bows',
  SPEARS: 'spears',
  SWORDS: 'swords',
};

export function StepProficiencies() {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<CreationDraft>();
  const { fields } = useFieldArray({ control, name: 'combat_proficiencies' });
  const proficiencies = useWatch({ control, name: 'combat_proficiencies' });
  const skills = useWatch({ control, name: 'skills' });

  const spent = estimatePreviousExperienceSpent({
    skills,
    combat_proficiencies: proficiencies,
  } as unknown as Character);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-display text-ink-navy">
            {t('creation.step.proficiencies.title')}
          </h2>
          <p className="font-body text-base text-ink-navy/70 mt-1">
            {t('creation.step.proficiencies.body')}
          </p>
        </div>
        <ExperienceMeter spent={spent} budget={10} />
      </header>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {fields.map((field, index) => {
          const proficiency = proficiencies[index]!;
          return (
            <li
              key={field.id}
              className="grid grid-cols-[minmax(0,1fr)_72px] items-center gap-2 border-b border-ink-red/20 py-1.5"
            >
              <span className="font-body text-base text-ink-navy">
                {t(`sheet.combat-proficiency.${PROFICIENCY_KEY[proficiency.name]}`)}
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={proficiency.rating}
                onChange={(event) =>
                  setValue(
                    `combat_proficiencies.${index}.rating`,
                    Math.max(0, Math.min(6, sanitiseDigits(event.target.value))),
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
                aria-label={t(`sheet.combat-proficiency.${PROFICIENCY_KEY[proficiency.name]}`)}
                className="bg-transparent border border-ink-red/40 px-2 py-1 text-center font-hand text-lg text-ink-navy"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
