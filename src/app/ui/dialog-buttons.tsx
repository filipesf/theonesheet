import type { ComponentPropsWithRef, ReactNode } from 'react';

type ButtonProps = ComponentPropsWithRef<'button'> & { children: ReactNode };

const BASE =
  'font-label text-eyebrow tracking-[0.2em] uppercase px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-soft cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

export function PrimaryButton({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`${BASE} bg-ink-red text-parchment-soft hover:bg-ink-red-soft active:bg-ink-red/90 focus-visible:ring-ink-red ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function DestructiveButton({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`${BASE} bg-ink-red text-parchment-soft hover:bg-ink-red-soft focus-visible:ring-ink-red ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`${BASE} border border-ink-red/60 text-ink-red hover:bg-ink-red/10 focus-visible:ring-ink-red ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
