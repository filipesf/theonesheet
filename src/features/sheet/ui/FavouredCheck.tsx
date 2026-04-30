import { useTranslation } from 'react-i18next';

type FavouredCheckProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

export function FavouredCheck({ checked, onChange, label }: FavouredCheckProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={t('sheet.aria.toggle-favoured', { name: label })}
      aria-pressed={checked}
      className={`relative h-3.5 w-3.5 border-2 border-ink-red cursor-pointer transition-colors hover:border-ink-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red-soft focus-visible:ring-offset-2 focus-visible:ring-offset-parchment before:absolute before:-inset-2 before:content-[''] ${
        checked ? 'bg-ink-red' : 'bg-transparent'
      }`}
    />
  );
}
