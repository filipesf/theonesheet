import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectionCard } from '../../../app/ui/SelectionCard';
import { HEROIC_CULTURES, type HeroicCulture } from '../../../domain/types';
import { CULTURES, MEDIAN_AGE_BY_CULTURE } from '../../../ref-data/cultures';
import { heroicCultureKey } from '../../../ref-data/labels';
import type { CreationDraft } from '../creationSchema';

export function StepCulture() {
  const { t } = useTranslation();
  const { control, setValue, formState } = useFormContext<CreationDraft>();
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
        {t('creation.step.culture.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.culture.body')}
      </p>
      <Controller
        name="heroic_culture"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HEROIC_CULTURES.map((culture: HeroicCulture) => {
              const active = field.value === culture;
              const meta = CULTURES[culture];
              return (
                <SelectionCard
                  key={culture}
                  active={active}
                  onClick={() => {
                    field.onChange(culture);
                    if (!formState.dirtyFields.age) {
                      setValue('age', MEDIAN_AGE_BY_CULTURE[culture], { shouldValidate: true });
                    }
                  }}
                >
                  <p className="font-display text-base tracking-section uppercase text-ink-navy">
                    {t(heroicCultureKey(culture))}
                  </p>
                  <p className="font-body text-sm text-ink-navy/70 mt-1">
                    {t('creation.step.culture.blessing-label')}: {t(`ref.blessings.${meta.blessingId}`)}
                  </p>
                </SelectionCard>
              );
            })}
          </div>
        )}
      />
    </div>
  );
}
