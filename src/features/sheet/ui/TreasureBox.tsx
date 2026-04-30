import { useTranslation } from 'react-i18next';

type TreasureBoxProps = {
  value: number;
  onChange: (value: number) => void;
};

export function TreasureBox({ value, onChange }: TreasureBoxProps) {
  const { t } = useTranslation();
  return (
    <label className="flex flex-col items-center gap-1 min-w-0">
      <span className="font-label text-microcaption tracking-label uppercase text-ink-red">
        {t('sheet.label.treasure')}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        aria-label={t('sheet.aria.treasure')}
        className="w-12 h-8 bg-transparent border-2 border-ink-red outline-none focus-visible:bg-ink-red/10 text-center font-hand text-lg text-ink-navy"
      />
    </label>
  );
}
