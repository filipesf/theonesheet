import type { ReactNode } from 'react';

export type DiamondSize = 'xs' | 'sm' | 'md' | 'lg';

type DiamondProps = {
  size?: DiamondSize;
  children: ReactNode;
  className?: string;
  filled?: boolean;
};

const SIZE_PX: Record<DiamondSize, number> = { xs: 28, sm: 40, md: 60, lg: 104 };

const VALUE_CLASS: Record<DiamondSize, string> = {
  xs: 'text-sm leading-none',
  sm: 'text-base leading-none',
  md: 'text-2xl leading-none',
  lg: 'text-[2.6rem] leading-none',
};

export function Diamond({
  size = 'md',
  children,
  className = '',
  filled,
}: DiamondProps) {
  const px = SIZE_PX[size];
  return (
    <span
      className={`relative inline-block align-middle ${className}`}
      style={{ width: px, height: px }}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 border-2 border-ink-red rotate-45 ${
          filled ? 'bg-ink-red' : ''
        }`}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className={`font-hand text-ink-navy ${VALUE_CLASS[size]}`}>
          {children}
        </span>
      </span>
    </span>
  );
}

type DiamondLabelProps = {
  children: ReactNode;
  className?: string;
};

export function DiamondLabel({ children, className = '' }: DiamondLabelProps) {
  return (
    <span
      className={`font-label text-microlabel tracking-[0.18em] uppercase text-ink-red leading-none whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
