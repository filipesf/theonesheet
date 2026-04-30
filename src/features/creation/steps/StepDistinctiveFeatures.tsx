import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CULTURE_FEATURES } from '../content/distinctive-features';
import type { CreationDraft } from '../creationSchema';

export function StepDistinctiveFeatures() {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<CreationDraft>();
  const culture = useWatch({ control, name: 'heroic_culture' });
  const picks = useWatch({ control, name: 'cultural_features' });
  const pool = CULTURE_FEATURES[culture];

  function toggle(feature: string) {
    const next = picks.includes(feature)
      ? picks.filter((f) => f !== feature)
      : picks.length < 2
        ? [...picks, feature]
        : picks;
    setValue('cultural_features', next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl tracking-[0.06em] text-ink-navy">
        {t('creation.step.features.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.features.body')}
      </p>
      <p className="font-label text-[10px] tracking-[0.22em] uppercase text-ink-red">
        {t('creation.step.features.picked', { count: picks.length, total: 2 })}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pool.map((feature) => {
          const active = picks.includes(feature);
          const disabled = !active && picks.length >= 2;
          return (
            <button
              key={feature}
              type="button"
              onClick={() => toggle(feature)}
              aria-pressed={active}
              disabled={disabled}
              className={`text-left p-3 border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 bg-parchment-soft/40 hover:border-ink-red/70'
              }`}
            >
              <span className="font-display text-sm tracking-[0.12em] uppercase text-ink-navy">
                {feature}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
