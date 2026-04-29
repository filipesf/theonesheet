type ConditionCheckProps = {
  checked: boolean;
  onChange?: () => void;
  label: string;
  readOnly?: boolean;
};

export function ConditionCheck({ checked, onChange, label, readOnly }: ConditionCheckProps) {
  const handleClick = readOnly ? undefined : onChange;
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={readOnly}
      aria-pressed={checked}
      className="flex items-center gap-2 cursor-pointer disabled:cursor-default group focus:outline-none"
    >
      <span
        aria-hidden="true"
        className={`inline-block h-4 w-4 border-2 border-ink-red transition-colors group-hover:border-ink-navy group-focus-visible:ring-2 group-focus-visible:ring-ink-red-soft group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-parchment ${
          checked ? 'bg-ink-red' : 'bg-transparent'
        } ${readOnly ? 'opacity-90' : ''}`}
      />
      <span className="font-body text-base text-ink-navy">{label}</span>
    </button>
  );
}
