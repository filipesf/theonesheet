import { useTranslation } from 'react-i18next';
import { buildHash } from './router';

export function SettingsPlaceholder() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto max-w-[800px] px-6 py-16 text-center">
      <p className="font-label text-[11px] tracking-[0.3em] uppercase text-ink-red mb-3">
        {t('app.placeholder.settings.eyebrow')}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink-navy mb-3">
        {t('app.placeholder.settings.title')}
      </h1>
      <p className="font-body text-base text-ink-navy/70 max-w-prose mx-auto mb-8">
        {t('app.placeholder.settings.body')}
      </p>
      <a
        href={buildHash({ name: 'library' })}
        className="font-label text-[11px] tracking-[0.2em] uppercase text-ink-red/80 hover:text-ink-red underline-offset-4 hover:underline transition-colors focus:outline-none focus-visible:underline"
      >
        {t('app.placeholder.back-to-library')}
      </a>
    </main>
  );
}
