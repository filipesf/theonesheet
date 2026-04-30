import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeName } from './theme/applyTheme';
import { buildHash, navigate, type Route } from './router';

type TopNavProps = {
  route: Route;
  onCreate: () => void;
  onExport: () => void;
  onImport: () => void;
  hasActiveCharacter: boolean;
  activeCharacterId: string | null;
  theme: ThemeName;
  onToggleTheme: () => void;
};

export function TopNav({
  route,
  onCreate,
  onExport,
  onImport,
  hasActiveCharacter,
  activeCharacterId,
  theme,
  onToggleTheme,
}: TopNavProps) {
  const { t } = useTranslation();
  const onSheetRoute = route.name === 'characterEditor' || route.name === 'characterPrinted';
  const sheetHref = activeCharacterId
    ? buildHash({ name: 'characterEditor', id: activeCharacterId })
    : buildHash({ name: 'library' });
  return (
    <header className="no-print sticky top-0 z-40 bg-shell text-parchment-soft border-b border-ink-red/40">
      <div className="mx-auto max-w-[1600px] flex items-center gap-6 px-4 sm:px-6 h-14">
        <a
          href={buildHash({ name: 'library' })}
          className="flex items-center gap-3 group"
          aria-label={t('nav.brand-aria')}
        >
          <BrandMark />
          <span className="font-display text-sm sm:text-base tracking-eyebrow uppercase text-parchment-soft group-hover:text-ink-red-soft transition-colors">
            {t('app.title')}
          </span>
        </a>

        <nav className="hidden sm:flex items-center gap-1 ml-2">
          <NavLink active={route.name === 'library'} href={buildHash({ name: 'library' })}>
            {t('nav.heroes')}
          </NavLink>
          {hasActiveCharacter && (
            <NavLink active={onSheetRoute} href={sheetHref}>
              {t('nav.sheet')}
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ToolsMenu
            onExport={onExport}
            onImport={onImport}
            hasActiveCharacter={hasActiveCharacter}
          />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <NavLink
            active={route.name === 'settings'}
            href={buildHash({ name: 'settings' })}
          >
            {t('nav.settings')}
          </NavLink>
          <PrimaryAction onClick={onCreate}>{t('nav.new-hero')}</PrimaryAction>
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-block h-6 w-6"
    >
      <span className="absolute inset-0 rotate-45 border-2 border-ink-red bg-shell" />
      <span className="absolute inset-1.5 rotate-45 bg-ink-red" />
    </span>
  );
}

function NavLink({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`relative px-3 py-2.5 font-label text-eyebrow tracking-label uppercase transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft rounded-sm ${
        active
          ? 'text-parchment-soft'
          : 'text-parchment-soft/70 hover:text-parchment-soft'
      }`}
    >
      {children}
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-3 right-3 -bottom-px h-[2px] bg-ink-red"
        />
      )}
    </a>
  );
}

function PrimaryAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-label text-eyebrow tracking-label uppercase bg-ink-red text-parchment-soft px-4 py-2.5 cursor-pointer hover:bg-ink-red-soft active:bg-ink-red/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-shell"
    >
      {children}
    </button>
  );
}

function ToolsMenu({
  onExport,
  onImport,
  hasActiveCharacter,
}: {
  onExport: () => void;
  onImport: () => void;
  hasActiveCharacter: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="font-label text-eyebrow tracking-label uppercase text-parchment-soft/80 hover:text-parchment-soft px-3 py-2.5 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft rounded-sm"
      >
        {t('nav.tools')}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[220px] bg-shell border border-ink-red/40 shadow-lg py-1"
        >
          <MenuItem
            onClick={() => run(onExport)}
            disabled={!hasActiveCharacter}
            hint={!hasActiveCharacter ? t('nav.export-no-active-hint') : undefined}
          >
            {t('nav.export-active')}
          </MenuItem>
          <MenuItem onClick={() => run(onImport)}>
            {t('nav.import-json')}
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  disabled,
  hint,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      aria-describedby={undefined}
      className="block w-full text-left px-3 py-2.5 font-label text-eyebrow tracking-label uppercase text-parchment-soft/85 hover:bg-ink-red/20 hover:text-parchment-soft cursor-pointer transition-colors focus:outline-none focus-visible:bg-ink-red focus-visible:text-parchment-soft disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-parchment-soft/85"
    >
      {children}
    </button>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: ThemeName; onToggle: () => void }) {
  const { t } = useTranslation();
  const labelKey =
    theme === 'parchment' ? 'nav.theme.toggle-to-dark' : 'nav.theme.toggle-to-parchment';
  const label = t(labelKey);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="relative h-9 w-9 flex items-center justify-center cursor-pointer text-parchment-soft/70 hover:text-parchment-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft rounded-sm transition-colors"
    >
      <span aria-hidden="true" className="relative inline-block h-4 w-4">
        <span className="absolute inset-0 rotate-45 border-2 border-current" />
        {theme === 'tor-dark' && (
          <span className="absolute inset-1 rotate-45 bg-current" />
        )}
      </span>
    </button>
  );
}

export { navigate };
