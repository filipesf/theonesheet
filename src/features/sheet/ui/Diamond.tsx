import type { CSSProperties, ReactNode } from 'react';

export type DiamondSize = 'xs' | 'sm' | 'md' | 'lg';

type DiamondProps = {
  size?: DiamondSize;
  children: ReactNode;
  className?: string;
  filled?: boolean;
};

const SIZE_VAR: Record<DiamondSize, string> = {
  xs: 'var(--size-diamond-xs)',
  sm: 'var(--size-diamond-sm)',
  md: 'var(--size-diamond-md)',
  lg: 'var(--size-diamond-lg)',
};

const VALUE_CLASS: Record<DiamondSize, string> = {
  xs: 'text-sm leading-none',
  sm: 'text-base leading-none',
  md: 'text-2xl leading-none',
  lg: 'text-diamond-lg leading-none',
};

export function Diamond({
  size = 'md',
  children,
  className = '',
  filled,
}: DiamondProps) {
  return (
    <span
      className={`relative inline-block align-middle ${className}`}
      style={{ width: SIZE_VAR[size], height: SIZE_VAR[size] }}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 border-2 border-ink-red rotate-45 ${
          filled ? 'bg-ink-red' : ''
        }`}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-body font-semibold tabular-nums text-ink-navy ${VALUE_CLASS[size]}`}
        >
          {children}
        </span>
      </span>
    </span>
  );
}

type DiamondLabelProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function DiamondLabel({ children, className = '', style }: DiamondLabelProps) {
  return (
    <span
      className={`font-label text-microlabel tracking-label uppercase text-ink-red leading-none whitespace-nowrap ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
