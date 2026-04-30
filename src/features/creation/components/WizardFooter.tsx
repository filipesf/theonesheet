import { useTranslation } from 'react-i18next';
import { GhostButton, PrimaryButton } from '../../../app/ui/dialog-buttons';

type Props = {
  isFirst: boolean;
  isLast: boolean;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  onFinalise?: () => void;
};

export function WizardFooter({
  isFirst,
  isLast,
  canAdvance,
  onBack,
  onNext,
  onCancel,
  onFinalise,
}: Props) {
  const { t } = useTranslation();
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ink-red/30 pt-5">
      <button
        type="button"
        onClick={onCancel}
        className="font-label text-[10px] tracking-[0.22em] uppercase text-ink-red/70 hover:text-ink-red underline-offset-4 hover:underline cursor-pointer focus:outline-none focus-visible:underline"
      >
        {t('creation.wizard.cancel')}
      </button>
      <div className="flex items-center gap-2">
        <GhostButton onClick={onBack} disabled={isFirst}>
          {t('creation.wizard.back')}
        </GhostButton>
        {isLast ? (
          <PrimaryButton onClick={onFinalise} disabled={!canAdvance}>
            {t('creation.wizard.finalise')}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onNext} disabled={!canAdvance}>
            {t('creation.wizard.next')}
          </PrimaryButton>
        )}
      </div>
    </footer>
  );
}
