import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'attribute' | 'resource';
  children: ReactNode;
};

export function SheetSectionFrame({ title, subtitle, variant = 'default', children }: Props) {
  return (
    <section className={`sheet-section-frame sheet-section-${variant}`}>
      <header className="sheet-section-header">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      <div className="sheet-rule" aria-hidden="true" />
      <div>{children}</div>
    </section>
  );
}
