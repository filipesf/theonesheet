import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectionCard } from '../../../app/ui/SelectionCard';
import { CULTURAL_DISTINCTIVE_FEATURES } from '../../../ref-data/distinctive-features';
import type { CreationDraft } from '../creationSchema';

export function StepDistinctiveFeatures() {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<CreationDraft>();
  const culture = useWatch({ control, name: 'heroic_culture' });
  const picks = useWatch({ control, name: 'cultural_features' });
  const pool = CULTURAL_DISTINCTIVE_FEATURES[culture];

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
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
        {t('creation.step.features.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.features.body')}
      </p>
      <p className="font-label text-microlabel tracking-label uppercase text-ink-red">
        {t('creation.step.features.picked', { count: picks.length, total: 2 })}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pool.map((featureId) => {
          const active = picks.includes(featureId);
          const disabled = !active && picks.length >= 2;
          return (
            <SelectionCard
              key={featureId}
              active={active}
              disabled={disabled}
              padding="sm"
              onClick={() => toggle(featureId)}
            >
              <span className="font-display text-sm tracking-section uppercase text-ink-navy">
                {t(`ref.distinctiveFeatures.canonical.${featureId}`)}
              </span>
            </SelectionCard>
          );
        })}
      </div>
    </div>
  );
}
