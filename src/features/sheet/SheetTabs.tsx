export type SheetSection =
  | 'identity'
  | 'attributes'
  | 'skills'
  | 'gear'
  | 'conditions'
  | 'rewards'
  | 'notes';

const SECTIONS: SheetSection[] = ['identity', 'attributes', 'skills', 'gear', 'conditions', 'rewards', 'notes'];

type Props = {
  active: SheetSection;
  onSelect: (section: SheetSection) => void;
};

export function SheetTabs({ active, onSelect }: Props) {
  return (
    <nav className="sheet-tabs" aria-label="Sheet sections">
      {SECTIONS.map((section) => (
        <button
          key={section}
          type="button"
          className={section === active ? 'active' : ''}
          onClick={() => onSelect(section)}
        >
          {section}
        </button>
      ))}
    </nav>
  );
}
