import type { CharacterRecord } from '../../persistence/local-storage';
import { CALLING_LABELS, HEROIC_CULTURE_LABELS } from '../../ref-data/labels';
import { CharacterCard } from './CharacterCard';

type LibraryPageProps = {
  characters: CharacterRecord[];
  activeCharacterId: string | null;
  onCreate: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onApplyBelba: () => void;
};

export function LibraryPage(props: LibraryPageProps) {
  const count = props.characters.length;
  return (
    <main className="mx-auto max-w-[1400px] px-4 sm:px-8 py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="font-label text-[11px] tracking-[0.3em] uppercase text-ink-red mb-2">
            ◆ The One Sheet · Heroes
          </p>
          <h1 className="font-display text-4xl sm:text-5xl tracking-[0.04em] text-ink-navy">
            Your Company
          </h1>
          <p className="mt-3 font-body text-base sm:text-lg text-ink-navy/70 max-w-prose">
            {count === 0
              ? 'No heroes yet. Begin a new tale, or summon Belba Bolger from the worked example to study a finished sheet.'
              : `${count} ${count === 1 ? 'hero' : 'heroes'} kept in your local library. Choose one to open the printed sheet, or forge another.`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={props.onCreate}
            className="font-label text-[11px] tracking-[0.2em] uppercase bg-ink-red text-parchment-soft px-5 py-2.5 cursor-pointer hover:bg-ink-red-soft active:bg-ink-red/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
          >
            Forge a New Hero
          </button>
          <button
            type="button"
            onClick={props.onApplyBelba}
            className="font-label text-[10px] tracking-[0.2em] uppercase text-ink-red/80 hover:text-ink-red cursor-pointer underline-offset-4 hover:underline transition-colors focus:outline-none focus-visible:underline"
          >
            Or load Belba Bolger ·  worked example
          </button>
        </div>
      </header>

      {count === 0 ? <EmptyState onCreate={props.onCreate} /> : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {props.characters.map((record) => (
            <li key={record.id}>
              <CharacterCard
                record={record}
                isActive={record.id === props.activeCharacterId}
                cultureLabel={HEROIC_CULTURE_LABELS[record.character.heroic_culture]}
                callingLabel={CALLING_LABELS[record.character.calling]}
                onView={() => props.onView(record.id)}
                onEdit={() => props.onEdit(record.id)}
                onDuplicate={() => props.onDuplicate(record.id)}
                onRename={() => props.onRename(record.id)}
                onDelete={() => props.onDelete(record.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border border-dashed border-ink-red/40 bg-parchment-soft/40 px-8 py-16 text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-6 inline-block h-10 w-10 rotate-45 border-2 border-ink-red"
      />
      <h2 className="font-display text-2xl tracking-[0.08em] text-ink-navy mb-2">
        No heroes yet
      </h2>
      <p className="font-body text-base text-ink-navy/70 max-w-md mx-auto mb-6">
        Every saga begins with a single name. Forge your first hero and the
        printed sheet will open ready to be filled in.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="font-label text-[11px] tracking-[0.2em] uppercase bg-ink-red text-parchment-soft px-5 py-2.5 cursor-pointer hover:bg-ink-red-soft active:bg-ink-red/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
      >
        Forge a New Hero
      </button>
    </div>
  );
}
