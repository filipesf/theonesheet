import { useTranslation } from 'react-i18next';

type PipProps = {
  filled: boolean;
  onClick?: () => void;
  ariaLabel: string;
};

export function Pip({ filled, onClick, ariaLabel }: PipProps) {
  // Visual is a 12 px rotated diamond (printed-sheet contract). Hit target is
  // expanded to ≥ 24 px via an invisible ::before so touch passes WCAG 2.5.8
  // without affecting layout in the skill grid.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={filled}
      className={`relative h-3 w-3 rotate-45 border-2 border-ink-red transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-parchment hover:border-ink-navy before:absolute before:-inset-2 before:content-[''] ${
        filled ? 'bg-ink-navy border-ink-navy' : 'bg-transparent'
      }`}
    />
  );
}

type PipRowProps = {
  rating: number;
  max?: number;
  onChange?: (rating: number) => void;
  label: string;
};

export function PipRow({ rating, max = 6, onChange, label }: PipRowProps) {
  const { t } = useTranslation();
  return (
    <div
      role="group"
      aria-label={t('sheet.aria.skill-rating', { name: label })}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: max }, (_, index) => {
        const value = index + 1;
        return (
          <Pip
            key={value}
            filled={rating >= value}
            ariaLabel={t('sheet.aria.skill-rating-value', { value, name: label })}
            onClick={
              onChange
                ? () => onChange(rating === value ? value - 1 : value)
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
