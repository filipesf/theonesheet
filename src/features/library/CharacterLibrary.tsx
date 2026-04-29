import type { CharacterRecord } from '../../persistence/local-storage';

type Props = {
  characters: CharacterRecord[];
  activeCharacterId: string | null;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
};

export function CharacterLibrary(props: Props) {
  return (
    <aside className="library-panel" aria-label="Character library">
      <div className="library-header">
        <h2>Library</h2>
        <button onClick={props.onCreate} type="button">
          New
        </button>
      </div>
      <ul>
        {props.characters.map((item) => (
          <li key={item.id} className={item.id === props.activeCharacterId ? 'active' : ''}>
            <button type="button" className="name-button" onClick={() => props.onSelect(item.id)}>
              {item.name}
            </button>
            <div className="actions">
              <button type="button" onClick={() => props.onDuplicate(item.id)}>
                Duplicate
              </button>
              <button type="button" onClick={() => props.onRename(item.id)}>
                Rename
              </button>
              <button type="button" onClick={() => props.onDelete(item.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
