import { useTranslation } from 'react-i18next';

type Props = {
  spent: number;
  budget: number;
};

export function ExperienceMeter({ spent, budget }: Props) {
  const { t } = useTranslation();
  const overspent = spent > budget;
  return (
    <div
      className={`flex items-baseline gap-2 px-3 py-2 border ${
        overspent ? 'border-ink-red bg-ink-red/10' : 'border-ink-red/40 bg-parchment-soft/60'
      }`}
    >
      <span className="font-label text-microlabel tracking-[0.22em] uppercase text-ink-red">
        {t('creation.wizard.experience')}
      </span>
      <span className="font-hand text-2xl text-ink-navy">
        {spent}
        <span className="text-ink-navy/40 mx-1">/</span>
        {budget}
      </span>
    </div>
  );
}
