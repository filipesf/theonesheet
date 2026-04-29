type Props = {
  label: string;
  value: string | number;
};

export function SheetStatLozenge({ label, value }: Props) {
  return (
    <div className="sheet-stat-lozenge">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
