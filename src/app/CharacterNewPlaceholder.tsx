import { useTranslation } from 'react-i18next';
import { buildHash } from './router';

type Props = {
  onQuickForge: () => void;
};

export function CharacterNewPlaceholder({ onQuickForge }: Props) {
  const { t } = useTranslation();
  return (
    <main className="mx-auto max-w-[800px] px-6 py-16 text-center">
      <p className="font-label text-[11px] tracking-[0.3em] uppercase text-ink-red mb-3">
        {t('app.placeholder.character-new.eyebrow')}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink-navy mb-3">
        {t('app.placeholder.character-new.title')}
      </h1>
      <p className="font-body text-base text-ink-navy/70 max-w-prose mx-auto mb-8">
        {t('app.placeholder.character-new.body')}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onQuickForge}
          className="font-label text-[11px] tracking-[0.2em] uppercase bg-ink-red text-parchment-soft px-5 py-2.5 cursor-pointer hover:bg-ink-red-soft active:bg-ink-red/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        >
          {t('app.placeholder.character-new.quick-forge')}
        </button>
        <a
          href={buildHash({ name: 'library' })}
          className="font-label text-[11px] tracking-[0.2em] uppercase text-ink-red/80 hover:text-ink-red underline-offset-4 hover:underline transition-colors focus:outline-none focus-visible:underline"
        >
          {t('app.placeholder.back-to-library')}
        </a>
      </div>
    </main>
  );
}
