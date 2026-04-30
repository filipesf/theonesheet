import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { CreationDraft } from '../creationSchema';

export function StepIdentity() {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = useFormContext<CreationDraft>();
  return (
    <div className="flex flex-col gap-4 max-w-md">
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
        {t('creation.step.identity.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.identity.body')}
      </p>
      <label className="flex flex-col gap-1">
        <span className="font-label text-microlabel tracking-label uppercase text-ink-red">
          {t('creation.step.identity.name-label')}
        </span>
        <input
          {...register('name')}
          className="bg-transparent border-0 border-b border-ink-red/60 outline-none font-body italic font-semibold text-2xl text-ink-navy py-1 focus:border-ink-red focus-visible:bg-ink-red/5 transition-colors"
        />
        {errors.name && (
          <span role="alert" className="font-body text-sm text-ink-red">
            {t('creation.step.identity.name-required')}
          </span>
        )}
      </label>
      <label className="flex flex-col gap-1 max-w-[120px]">
        <span className="font-label text-microlabel tracking-label uppercase text-ink-red">
          {t('creation.step.identity.age-label')}
        </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          {...register('age', {
            setValueAs: (raw: unknown) =>
              typeof raw === 'string' && raw.trim() === '' ? undefined : Number(raw),
          })}
          className="bg-transparent border-0 border-b border-ink-red/60 outline-none font-body font-semibold tabular-nums text-2xl text-ink-navy py-1 focus:border-ink-red focus-visible:bg-ink-red/5 transition-colors"
        />
        {errors.age && (
          <span role="alert" className="font-body text-sm text-ink-red">
            {t('creation.step.identity.age-range')}
          </span>
        )}
      </label>
    </div>
  );
}
