import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { buildHash, navigate, type Route } from './router';

type TopNavProps = {
  route: Route;
  onExport: () => void;
  onImport: () => void;
  onCreate: () => void;
  hasActiveCharacter: boolean;
};

export function TopNav({ route, onExport, onImport, onCreate, hasActiveCharacter }: TopNavProps) {
  const { t } = useTranslation();
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
            <NavLink active={route.name === 'sheet'} href={route.name === 'sheet' ? buildHash(route) : '#/library'}>
              {t('nav.sheet')}
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ToolsMenu onExport={onExport} onImport={onImport} />
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

function ToolsMenu({ onExport, onImport }: { onExport: () => void; onImport: () => void }) {
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
          <MenuItem
            onClick={() => {
              onExport();
              setOpen(false);
            }}
          >
            {t('nav.export-active')}
          </MenuItem>
          <MenuItem
            onClick={() => {
              onImport();
              setOpen(false);
            }}
          >
            {t('nav.import-json')}
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="block w-full text-left px-3 py-2 font-label text-[11px] tracking-[0.18em] uppercase text-parchment-soft/85 hover:bg-ink-red/20 hover:text-parchment-soft cursor-pointer transition-colors focus:outline-none focus-visible:bg-ink-red/30"
    >
      {children}
    </button>
  );
}

export { navigate };
