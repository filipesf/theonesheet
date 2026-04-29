import { useState } from 'react';
import { CharacterLibrary } from '../features/library/CharacterLibrary';
import { useCharacterLibrary } from '../features/library/useCharacterLibrary';
import { SheetTabs, type SheetSection } from '../features/sheet/SheetTabs';
import { CharacterEditor } from '../features/sheet/editor/CharacterEditor';

export default function App() {
  const [section, setSection] = useState<SheetSection>('identity');
  const library = useCharacterLibrary();

  return (
    <main className="app-shell">
      <header>
        <h1>The One Sheet</h1>
        <p>Single-page local character manager</p>
      </header>

      <div className="layout-grid">
        <CharacterLibrary
          characters={library.characters}
          activeCharacterId={library.activeCharacterId}
          onCreate={library.createCharacter}
          onSelect={library.switchCharacter}
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

        <section>
          <SheetTabs active={section} onSelect={setSection} />
          {library.activeCharacter ? (
            <CharacterEditor
              section={section}
              character={library.activeCharacter}
              onChange={library.updateCharacter}
            />
          ) : (
            <p>Create your first character from the library.</p>
          )}
        </section>
      </div>
    </main>
  );
}
