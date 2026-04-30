import { useTranslation } from 'react-i18next';
import { STEP_ORDER, type StepName } from '../creationSchema';

type Props = {
  currentStep: StepName;
  children: React.ReactNode;
};

export function WizardShell({ currentStep, children }: Props) {
  const { t } = useTranslation();
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-10">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="font-label text-eyebrow tracking-[0.3em] uppercase text-ink-red mb-3">
          {t('creation.wizard.eyebrow')}
        </p>
        <ol className="flex flex-col gap-1.5">
          {STEP_ORDER.map((step, index) => {
            const active = step === currentStep;
            const done = index < currentIndex;
            const statusKey = active
              ? 'creation.wizard.step-status-current'
              : done
                ? 'creation.wizard.step-status-completed'
                : 'creation.wizard.step-status-upcoming';
            return (
              <li
                key={step}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-3 px-3 py-2 border-l-2 ${
                  active
                    ? 'border-ink-red bg-parchment-soft'
                    : done
                      ? 'border-ink-red/50 text-ink-navy/70'
                      : 'border-ink-red/20 text-ink-navy/50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="font-label text-microlabel tracking-[0.18em] uppercase w-5 inline-flex justify-center"
                >
                  {done ? '✓' : String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-sm tracking-[0.12em] uppercase">
                  {t(`creation.step.${step}.title`)}
                </span>
                <span className="sr-only">{t(statusKey)}</span>
              </li>
            );
          })}
        </ol>
      </aside>
      <section className="min-w-0">{children}</section>
    </main>
  );
}
