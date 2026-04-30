import type { ComponentPropsWithRef, ReactNode } from 'react';

type Props = ComponentPropsWithRef<'button'> & {
  active?: boolean;
  padding?: 'sm' | 'md';
  children: ReactNode;
};

const PADDING: Record<NonNullable<Props['padding']>, string> = {
  sm: 'p-3',
  md: 'p-4',
};

export function SelectionCard({
  active = false,
  padding = 'md',
  className,
  children,
  ...rest
}: Props) {
  const stateCls = active
    ? 'border-ink-red bg-parchment-soft'
    : 'border-ink-red/40 bg-parchment-soft/40 hover:border-ink-red/70';
  return (
    <button
      type="button"
      aria-pressed={active}
      {...rest}
      className={`text-left ${PADDING[padding]} border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:opacity-50 ${stateCls} ${className ?? ''}`}
    >
      {children}
    </button>
  );
}
