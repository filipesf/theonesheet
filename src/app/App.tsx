import { useState } from 'react';
import { createBelbaWorkedExample } from '../domain/schema';
import { CharacterLibrary } from '../features/library/CharacterLibrary';
import { ImportExportPanel } from '../features/library/import-export/ImportExportPanel';
import { useCharacterLibrary } from '../features/library/useCharacterLibrary';
import { PrintedCharacterSheet } from '../features/sheet/PrintedCharacterSheet';

export default function App() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const library = useCharacterLibrary();

  return (
    <main className="sheet-app-shell">
      <aside className={`library-drawer${libraryOpen ? ' is-open' : ''}`}>
        <CharacterLibrary
          characters={library.characters}
          activeCharacterId={library.activeCharacterId}
          onCreate={library.createCharacter}
          onSelect={(id) => {
            library.switchCharacter(id);
            setLibraryOpen(false);
          }}
          onDuplicate={library.duplicateCharacter}
          onRename={(id) => {
            const current = library.characters.find((item) => item.id === id);
            const name = prompt('Rename character', current?.name ?? '');
            if (name && name.trim()) {
              library.renameCharacter(id, name.trim());
            }
          }}
          onDelete={(id) => {
            if (confirm('Delete character?')) {
              library.deleteCharacter(id);
            }
          }}
        />
      </aside>

      <section className="sheet-stage">
        <header className="sheet-stage-header">
          <div>
            <h1>The One Sheet</h1>
            <p>Single-page local character manager</p>
          </div>
          <button type="button" className="library-toggle" onClick={() => setLibraryOpen((value) => !value)}>
            {libraryOpen ? 'Hide library' : 'Open library'}
          </button>
        </header>
        <div className="sheet-utility-controls">
          <ImportExportPanel
            activeCharacterId={library.activeCharacterId}
            onExport={library.exportCharacter}
            onImport={library.importCharacter}
          />
          <button
            type="button"
            onClick={() => {
              const base = createBelbaWorkedExample();
              if (library.activeCharacter) {
                library.updateCharacter({ ...base, id: library.activeCharacter.id, company_id: library.activeCharacter.company_id });
              }
            }}
          >
            Apply Belba Example
          </button>
        </div>
        <section className="sheet-workspace">
          {library.activeCharacter ? (
            <PrintedCharacterSheet character={library.activeCharacter} onChange={library.updateCharacter} />
          ) : (
            <p>Create your first character from the library.</p>
          )}
        </section>
      </section>
    </main>
  );
}
