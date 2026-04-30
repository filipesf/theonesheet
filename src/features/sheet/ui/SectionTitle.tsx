import type { ReactNode } from 'react';

type SectionTitleProps = {
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function SectionTitle({ children, trailing, className = '' }: SectionTitleProps) {
  return (
    <header
      className={`relative border-t border-ink-red flex items-center justify-center -mt-2 ${className}`}
    >
      <h2 className="bg-parchment px-3 font-display text-base sm:text-lg tracking-label uppercase text-ink-red">
        {children}
      </h2>
      {trailing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-parchment px-2">
          {trailing}
        </div>
      )}
    </header>
  );
}
