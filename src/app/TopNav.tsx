import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildHash, navigate, type Route } from './router';

type TopNavProps = {
  route: Route;
  onCreate: () => void;
  hasActiveCharacter: boolean;
  activeCharacterId: string | null;
};

export function TopNav({
  route,
  onCreate,
  hasActiveCharacter,
  activeCharacterId,
}: TopNavProps) {
  const { t } = useTranslation();
  const onSheetRoute = route.name === 'characterEditor' || route.name === 'characterPrinted';
  const sheetHref = activeCharacterId
    ? buildHash({ name: 'characterEditor', id: activeCharacterId })
    : buildHash({ name: 'library' });
  return (
    <header className="no-print sticky top-0 z-40 bg-[#1a1410] text-parchment-soft border-b border-ink-red/40">
      <div className="mx-auto max-w-[1600px] flex items-center gap-6 px-4 sm:px-6 h-14">
        <a
          href={buildHash({ name: 'library' })}
          className="flex items-center gap-3 group"
          aria-label={t('nav.brand-aria')}
        >
          <BrandMark />
          <span className="font-display text-sm sm:text-base tracking-[0.28em] uppercase text-parchment-soft group-hover:text-ink-red-soft transition-colors">
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
          <ToolsMenu />
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
      <span className="absolute inset-0 rotate-45 border-2 border-ink-red bg-[#1a1410]" />
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
      className={`relative px-3 py-2 font-label text-[11px] tracking-[0.2em] uppercase transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-red-soft rounded-sm ${
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
      className="font-label text-[11px] tracking-[0.2em] uppercase bg-ink-red text-parchment-soft px-3.5 py-2 cursor-pointer hover:bg-ink-red-soft active:bg-ink-red/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1410]"
    >
      {children}
    </button>
  );
}

function ToolsMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // Tools is a navigation shortcut to the Settings → Personagens section so
  // there is a single source of truth for import/export controls.
  const settingsHref = buildHash({ name: 'settings' });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="font-label text-[11px] tracking-[0.2em] uppercase text-parchment-soft/80 hover:text-parchment-soft px-3 py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-red-soft rounded-sm"
      >
        {t('nav.tools')}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[200px] bg-[#1a1410] border border-ink-red/40 shadow-lg py-1"
        >
          <MenuLink href={settingsHref} onSelect={() => setOpen(false)}>
            {t('nav.export-active')}
          </MenuLink>
          <MenuLink href={settingsHref} onSelect={() => setOpen(false)}>
            {t('nav.import-json')}
          </MenuLink>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="block w-full text-left px-3 py-2 font-label text-[11px] tracking-[0.18em] uppercase text-parchment-soft/85 hover:bg-ink-red/20 hover:text-parchment-soft cursor-pointer transition-colors focus:outline-none focus-visible:bg-ink-red/30"
    >
      {children}
    </a>
  );
}

export { navigate };
