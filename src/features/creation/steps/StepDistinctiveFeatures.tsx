import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CULTURAL_DISTINCTIVE_FEATURES } from '../../../ref-data/distinctive-features';
import type { CreationDraft } from '../creationSchema';

const CULTURE_KEY: Record<string, string> = {
  DWARVES_OF_DURINS_FOLK: 'dwarves-of-durins-folk',
  BARDINGS: 'bardings',
  ELVES_OF_LINDON: 'elves-of-lindon',
  HOBBITS_OF_THE_SHIRE: 'hobbits-of-the-shire',
  MEN_OF_BREE: 'men-of-bree',
  RANGERS_OF_THE_NORTH: 'rangers-of-the-north',
};

export function StepDistinctiveFeatures() {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<CreationDraft>();
  const culture = useWatch({ control, name: 'heroic_culture' });
  const picks = useWatch({ control, name: 'cultural_features' });
  const pool = CULTURAL_DISTINCTIVE_FEATURES[culture];
  const cultureKey = CULTURE_KEY[culture] ?? '';

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
      <p className="font-label text-microlabel tracking-[0.22em] uppercase text-ink-red">
        {t('creation.step.features.picked', { count: picks.length, total: 2 })}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pool.map((featureId) => {
          const active = picks.includes(featureId);
          const disabled = !active && picks.length >= 2;
          return (
            <button
              key={featureId}
              type="button"
              onClick={() => toggle(featureId)}
              aria-pressed={active}
              disabled={disabled}
              className={`text-left p-3 border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 bg-parchment-soft/40 hover:border-ink-red/70'
              }`}
            >
              <span className="font-display text-sm tracking-[0.12em] uppercase text-ink-navy">
                {t(`ref.distinctiveFeatures.cultures.${cultureKey}.${featureId}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
