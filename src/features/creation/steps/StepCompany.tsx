import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectionCard } from '../../../app/ui/SelectionCard';
import { callingKey } from '../../../ref-data/labels';
import { PATRONS, type PatronId } from '../../../ref-data/patrons';
import type { CreationDraft } from '../creationSchema';

export function StepCompany() {
  const { t } = useTranslation();
  const { control, setValue, register } = useFormContext<CreationDraft>();
  const patronId = useWatch({ control, name: 'patron_id' });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
        {t('creation.step.company.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.company.body')}
      </p>

      <Block title={t('creation.step.company.patron')}>
        <p className="font-body text-sm text-ink-navy/70 mb-2">
          {t('creation.step.company.patron-body')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PATRONS.map((patron) => (
            <SelectionCard
              key={patron.id}
              active={patronId === patron.id}
              padding="sm"
              onClick={() =>
                setValue('patron_id', patronId === patron.id ? '' : (patron.id as PatronId), {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <p className="font-display text-sm tracking-section uppercase text-ink-navy">
                {t(`ref.patrons.${patron.id}`)}
              </p>
              <p className="font-body text-xs text-ink-navy/70 mt-1">
                {t('creation.step.company.patron-fellowship', { bonus: patron.fellowshipBonus })}
              </p>
              <p className="font-label text-microcaption tracking-section uppercase text-ink-red/70 mt-1">
                {t('creation.step.company.patron-callings')}:{' '}
                {patron.favouredCallings.map((c) => t(callingKey(c))).join(' · ')}
              </p>
            </SelectionCard>
          ))}
        </div>
      </Block>

      <Block title={t('creation.step.company.safe-haven')}>
        <p className="font-body text-sm text-ink-navy/70 mb-2">
          {t('creation.step.company.safe-haven-body')}
        </p>
        <input
          type="text"
          {...register('safe_haven')}
          placeholder={t('creation.step.company.safe-haven-placeholder')}
          className="bg-parchment-soft border border-ink-red/40 px-3 py-2 font-body text-base text-ink-navy"
        />
      </Block>

      <p className="font-label text-microcaption tracking-label uppercase text-ink-red/70">
        {t('creation.step.company.fellowship-focus-note')}
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-display text-base tracking-label uppercase text-ink-red border-b border-ink-red/30 pb-1">
        {title}
      </h3>
      {children}
    </section>
  );
}
