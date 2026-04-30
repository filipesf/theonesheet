import { useTranslation } from 'react-i18next';
import { toggleDiceTray, useDiceTray } from './useDiceTray';

export function DiceTrayLauncher() {
  const { t } = useTranslation();
  const { open } = useDiceTray();
  if (open) return null;
  return (
    <button
      type="button"
      onClick={toggleDiceTray}
      data-dice="ui"
      aria-label={t('dice.launcher.aria')}
      title={t('dice.launcher.title')}
      className="no-print fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-ink-red text-parchment-soft border-2 border-ink-red shadow-launcher hover:bg-ink-red-soft active:bg-ink-red/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-parchment cursor-pointer"
    >
      <span aria-hidden="true" className="text-base leading-none">⚀</span>
      <span className="font-label text-eyebrow tracking-[0.22em] uppercase">
        {t('dice.launcher.label')}
      </span>
      <kbd className="font-label text-microcaption tracking-[0.2em] uppercase bg-ink-red-soft/40 px-1.5 py-0.5">
        D
      </kbd>
    </button>
  );
}
