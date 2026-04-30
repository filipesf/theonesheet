import { useTranslation } from 'react-i18next';
import type { ThemeName } from '../../app/theme/applyTheme';
import { GhostButton, PrimaryButton } from '../../app/ui/dialog-buttons';
import { SelectionCard } from '../../app/ui/SelectionCard';
import { useSettings } from './useSettings';

const APP_VERSION = '0.0.0';
const ROADMAP_URL = 'https://github.com/filipesf/theonesheet/blob/main/docs/ROADMAP.md';
const REPO_URL = 'https://github.com/filipesf/theonesheet';

type Props = {
  onImport: () => void;
  onExport: () => void;
  hasActiveCharacter: boolean;
};

export function SettingsPage({ onImport, onExport, hasActiveCharacter }: Props) {
  const { t } = useTranslation();
  const { settings, setTheme } = useSettings();

  return (
    <main className="mx-auto max-w-[900px] px-4 sm:px-6 py-10 lg:py-14 flex flex-col gap-10">
      <header>
        <p className="font-label text-eyebrow tracking-eyebrow uppercase text-ink-red mb-2">
          {t('settings.eyebrow')}
        </p>
        <h1 className="font-display text-4xl tracking-display text-ink-navy">
          {t('settings.title')}
        </h1>
      </header>

      <Section title={t('settings.appearance.heading')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ThemeCard
            theme="parchment"
            active={settings.theme === 'parchment'}
            label={t('settings.appearance.theme-parchment')}
            description={t('settings.appearance.theme-parchment-description')}
            onPick={() => setTheme('parchment')}
          />
          <ThemeCard
            theme="tor-dark"
            active={settings.theme === 'tor-dark'}
            label={t('settings.appearance.theme-tor-dark')}
            description={t('settings.appearance.theme-tor-dark-description')}
            onPick={() => setTheme('tor-dark')}
          />
        </div>
      </Section>

      <Section title={t('settings.language.heading')}>
        <div className="flex flex-col gap-2">
          <p className="font-body text-base text-ink-navy">
            {t('settings.language.current-label')}
            <span className="ml-2 font-label text-microcaption tracking-label uppercase text-ink-red/70">
              {t('settings.language.current-helper')}
            </span>
          </p>
          <p className="font-body text-sm text-ink-navy/60">
            {t('settings.language.note')}
          </p>
        </div>
      </Section>

      <Section title={t('settings.characters.heading')} id="personagens">
        <div className="flex flex-wrap gap-3 items-center">
          <PrimaryButton
            onClick={onExport}
            disabled={!hasActiveCharacter}
            aria-describedby={!hasActiveCharacter ? 'export-helper' : undefined}
          >
            {t('settings.characters.export-active')}
          </PrimaryButton>
          <GhostButton onClick={onImport}>
            {t('settings.characters.import')}
          </GhostButton>
        </div>
        {!hasActiveCharacter && (
          <p id="export-helper" className="font-body text-sm text-ink-navy/60 mt-2">
            {t('settings.characters.export-no-active')}
          </p>
        )}
      </Section>

      <Section title={t('settings.about.heading')}>
        <ul className="flex flex-col gap-1.5 font-body text-base text-ink-navy/80">
          <li>{t('settings.about.version', { version: APP_VERSION })}</li>
          <li>
            <a
              href={ROADMAP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-ink-red hover:text-ink-red-soft underline-offset-4 hover:underline"
            >
              {t('settings.about.roadmap-link')}
            </a>
          </li>
          <li>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-ink-red hover:text-ink-red-soft underline-offset-4 hover:underline"
            >
              {t('settings.about.repo-link')}
            </a>
          </li>
        </ul>
      </Section>
    </main>
  );
}

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-3">
      <h2 className="font-display text-xl tracking-label uppercase text-ink-red border-b border-ink-red/30 pb-2">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function ThemeCard({
  theme,
  active,
  label,
  description,
  onPick,
}: {
  theme: ThemeName;
  active: boolean;
  label: string;
  description: string;
  onPick: () => void;
}) {
  // Hex literals are intentional here: each swatch must show the OTHER theme's
  // palette regardless of the active theme, so tokens (which would swap) are
  // wrong. Mirror the values from styles.css when palettes change.
  const swatch =
    theme === 'parchment'
      ? ['bg-[#f5efe0]', 'bg-[#a33024]', 'bg-[#1f2c5c]']
      : ['bg-[#1a1612]', 'bg-[#c98a3b]', 'bg-[#e9dcc0]'];
  return (
    <SelectionCard active={active} onClick={onPick}>
      <div className="flex items-center gap-2 mb-2">
        {swatch.map((cls, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`inline-block h-5 w-5 rotate-45 border border-ink-red/30 ${cls}`}
          />
        ))}
      </div>
      <p className="font-display text-base tracking-section uppercase text-ink-navy mb-1">
        {label}
      </p>
      <p className="font-body text-sm text-ink-navy/70">{description}</p>
    </SelectionCard>
  );
}
