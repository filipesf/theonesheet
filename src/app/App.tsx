import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { createBelbaWorkedExample, toExportFile } from '../domain/schema';
import { LibraryPage } from '../features/library/LibraryPage';
import { useCharacterLibrary } from '../features/library/useCharacterLibrary';
import { PrintedCharacterSheet } from '../features/sheet/PrintedCharacterSheet';
import { TopNav } from './TopNav';
import { buildHash, navigate, useRoute } from './router';

export default function App() {
  const { t } = useTranslation();
  const route = useRoute();
  const library = useCharacterLibrary();

  const activeCharacter = useMemo(() => {
    if (route.name !== 'sheet') return null;
    return library.characters.find((item) => item.id === route.id)?.character ?? null;
  }, [route, library.characters]);

  useEffect(() => {
    if (route.name === 'sheet' && route.id !== library.activeCharacterId) {
      library.switchCharacter(route.id);
    }
  }, [route, library]);

  function handleCreate() {
    const id = library.createCharacter();
    navigate({ name: 'sheet', id });
  }

  function handleApplyBelba() {
    const base = createBelbaWorkedExample();
    const result = library.importCharacter(JSON.stringify(toExportFile(base)));
    if (result.ok) {
      navigate({ name: 'sheet', id: result.id });
    }
  }

  function handleExport() {
    const id = route.name === 'sheet' ? route.id : library.activeCharacterId;
    if (!id) {
      alert(t('common.alert.export-need-character'));
      return;
    }
    const payload = library.exportCharacter(id);
    if (!payload) {
      alert(t('common.alert.export-failed'));
      return;
    }
    navigator.clipboard.writeText(payload).then(
      () => alert(t('common.alert.copied')),
      () => alert(t('common.alert.copy-failed')),
    );
  }

  function handleImport() {
    const input = prompt(t('common.prompt.import'));
    if (!input) return;
    const result = library.importCharacter(input);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    navigate({ name: 'sheet', id: result.id });
  }

  return (
    <div className="min-h-screen bg-parchment text-ink-navy">
      <TopNav
        route={route}
        onCreate={handleCreate}
        onExport={handleExport}
        onImport={handleImport}
        hasActiveCharacter={Boolean(library.activeCharacterId)}
      />

      {route.name === 'library' && (
        <LibraryPage
          characters={library.characters}
          activeCharacterId={library.activeCharacterId}
          onCreate={handleCreate}
          onView={(id) => navigate({ name: 'sheet', id })}
          onEdit={(id) => navigate({ name: 'sheet', id })}
          onDuplicate={(id) => {
            const newId = library.duplicateCharacter(id);
            if (newId) navigate({ name: 'sheet', id: newId });
          }}
          onRename={(id) => {
            const current = library.characters.find((item) => item.id === id);
            const name = prompt(t('common.prompt.rename'), current?.name ?? '');
            if (name && name.trim()) {
              library.renameCharacter(id, name.trim());
            }
          }}
          onDelete={(id) => {
            if (confirm(t('common.confirm.delete'))) {
              library.deleteCharacter(id);
            }
          }}
          onApplyBelba={handleApplyBelba}
        />
      )}

      {route.name === 'sheet' && (
        <SheetRoute
          character={activeCharacter}
          onChange={library.updateCharacter}
        />
      )}
    </div>
  );
}

function SheetRoute({
  character,
  onChange,
}: {
  character: ReturnType<typeof useCharacterLibrary>['activeCharacter'];
  onChange: (
    character: NonNullable<ReturnType<typeof useCharacterLibrary>['activeCharacter']>,
  ) => void;
}) {
  const { t } = useTranslation();
  if (!character) {
    return (
      <main className="mx-auto max-w-[1200px] px-6 py-16 text-center">
        <p className="font-label text-[11px] tracking-[0.25em] uppercase text-ink-red mb-3">
          {t('common.lost-page.eyebrow')}
        </p>
        <h1 className="font-display text-3xl text-ink-navy mb-3">
          {t('common.lost-page.title')}
        </h1>
        <p className="font-body text-base text-ink-navy/70 mb-6">
          {t('common.lost-page.body')}
        </p>
        <a
          href={buildHash({ name: 'library' })}
          className="inline-block font-label text-[11px] tracking-[0.2em] uppercase bg-ink-red text-parchment-soft px-5 py-2.5 cursor-pointer hover:bg-ink-red-soft transition-colors"
        >
          {t('common.lost-page.back-to-library')}
        </a>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 sm:py-8">
      <PrintedCharacterSheet character={character} onChange={onChange} />
    </main>
  );
}
