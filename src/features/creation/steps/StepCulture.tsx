import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { HEROIC_CULTURES, type HeroicCulture } from '../../../domain/types';
import { CULTURES, MEDIAN_AGE_BY_CULTURE } from '../../../ref-data/cultures';
import { heroicCultureKey } from '../../../ref-data/labels';
import type { CreationDraft } from '../creationSchema';

export function StepCulture() {
  const { t } = useTranslation();
  const { control, setValue, formState } = useFormContext<CreationDraft>();
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl tracking-[0.06em] text-ink-navy">
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
                <button
                  key={culture}
                  type="button"
                  onClick={() => {
                    field.onChange(culture);
                    if (!formState.dirtyFields.age) {
                      setValue('age', MEDIAN_AGE_BY_CULTURE[culture], { shouldValidate: true });
                    }
                  }}
                  aria-pressed={active}
                  className={`text-left p-4 border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
                    active ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 bg-parchment-soft/40 hover:border-ink-red/70'
                  }`}
                >
                  <p className="font-display text-base tracking-[0.12em] uppercase text-ink-navy">
                    {t(heroicCultureKey(culture))}
                  </p>
                  <p className="font-body text-sm text-ink-navy/70 mt-1">
                    {t('creation.step.culture.blessing-label')}: {t(`ref.blessings.${meta.blessingId}`)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      />
    </div>
  );
}
