import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster, toast } from 'sonner';
import { createBelbaWorkedExample, toExportFile } from '../domain/schema';
import { LibraryPage } from '../features/library/LibraryPage';
import { useCharacterLibrary } from '../features/library/useCharacterLibrary';
import { CharacterNewPlaceholder } from './CharacterNewPlaceholder';
import { EditorShell } from './EditorShell';
import { PrintedShell } from './PrintedShell';
import { SettingsPlaceholder } from './SettingsPlaceholder';
import { TopNav } from './TopNav';
import { DeleteCharacterDialog } from './ui/DeleteCharacterDialog';
import { ImportCharacterDialog } from './ui/ImportCharacterDialog';
import { RenameCharacterDialog } from './ui/RenameCharacterDialog';
import { buildHash, navigate, useRoute, type Route } from './router';

function routeId(route: Route): string | null {
  if (route.name === 'characterEditor' || route.name === 'characterPrinted') {
    return route.id;
  }
  return null;
}

export default function App() {
  const { t } = useTranslation();
  const route = useRoute();
  const library = useCharacterLibrary();

  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const activeId = routeId(route);

  const activeCharacter = useMemo(() => {
    if (!activeId) return null;
    return library.characters.find((item) => item.id === activeId)?.character ?? null;
  }, [activeId, library.characters]);

  const renameTarget = useMemo(
    () => library.characters.find((item) => item.id === renameTargetId) ?? null,
    [library.characters, renameTargetId],
  );
  const deleteTarget = useMemo(
    () => library.characters.find((item) => item.id === deleteTargetId) ?? null,
    [library.characters, deleteTargetId],
  );

  useEffect(() => {
    if (activeId && activeId !== library.activeCharacterId) {
      library.switchCharacter(activeId);
    }
  }, [activeId, library]);

  // Reset scroll on route change, except when toggling between editor and
  // printed views of the same character — preserves position on Print/Edit.
  const previousRoute = useRef<Route | null>(null);
  useEffect(() => {
    const previous = previousRoute.current;
    previousRoute.current = route;
    if (!previous) return;
    const samePair =
      (previous.name === 'characterEditor' || previous.name === 'characterPrinted') &&
      (route.name === 'characterEditor' || route.name === 'characterPrinted') &&
      previous.id === route.id;
    if (!samePair) {
      window.scrollTo(0, 0);
    }
  }, [route]);

  function handleCreate() {
    navigate({ name: 'characterNew' });
  }

  function handleQuickForge() {
    const id = library.createCharacter();
    navigate({ name: 'characterEditor', id });
  }

  function handleApplyBelba() {
    const base = createBelbaWorkedExample();
    const result = library.importCharacter(JSON.stringify(toExportFile(base)));
    if (result.ok) {
      navigate({ name: 'characterEditor', id: result.id });
    }
  }

  function handleExport() {
    const id = activeId ?? library.activeCharacterId;
    if (!id) {
      toast.warning(t('toast.export.no-active'));
      return;
    }
    const payload = library.exportCharacter(id);
    if (!payload) {
      toast.error(t('toast.export.failed'));
      return;
    }
    navigator.clipboard.writeText(payload).then(
      () => toast.success(t('toast.export.copied')),
      () => toast.error(t('toast.export.clipboard-failed')),
    );
  }

  return (
    <div className="min-h-screen bg-parchment text-ink-navy">
      <TopNav
        route={route}
        onCreate={handleCreate}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
        hasActiveCharacter={Boolean(library.activeCharacterId)}
        activeCharacterId={library.activeCharacterId}
      />

      {route.name === 'library' && (
        <LibraryPage
          characters={library.characters}
          activeCharacterId={library.activeCharacterId}
          onCreate={handleCreate}
          onView={(id) => navigate({ name: 'characterPrinted', id })}
          onEdit={(id) => navigate({ name: 'characterEditor', id })}
          onDuplicate={(id) => {
            const newId = library.duplicateCharacter(id);
            if (newId) navigate({ name: 'characterEditor', id: newId });
          }}
          onRename={(id) => setRenameTargetId(id)}
          onDelete={(id) => setDeleteTargetId(id)}
          onApplyBelba={handleApplyBelba}
        />
      )}

      {route.name === 'characterNew' && (
        <CharacterNewPlaceholder onQuickForge={handleQuickForge} />
      )}

      {route.name === 'characterEditor' && (
        activeCharacter ? (
          <EditorShell character={activeCharacter} onChange={library.updateCharacter} />
        ) : (
          <MissingCharacter />
        )
      )}

      {route.name === 'characterPrinted' && (
        activeCharacter ? (
          <PrintedShell character={activeCharacter} onChange={library.updateCharacter} />
        ) : (
          <MissingCharacter />
        )
      )}

      {route.name === 'settings' && <SettingsPlaceholder />}

      <RenameCharacterDialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTargetId(null);
        }}
        currentName={renameTarget?.name ?? ''}
        onConfirm={(name) => {
          if (!renameTarget) return;
          library.renameCharacter(renameTarget.id, name);
          toast.success(t('toast.rename.done'));
        }}
      />

      <DeleteCharacterDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        characterName={deleteTarget?.name ?? ''}
        onConfirm={() => {
          if (!deleteTarget) return;
          library.deleteCharacter(deleteTarget.id);
          toast.success(t('toast.delete.done'));
        }}
      />

      <ImportCharacterDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={(payload) => {
          const result = library.importCharacter(payload);
          if (!result.ok) return { ok: false, code: result.code };
          return { ok: true, id: result.id };
        }}
        onSuccess={(id) => {
          toast.success(t('toast.import.done'));
          navigate({ name: 'characterEditor', id });
        }}
      />

      <Toaster
        position="top-right"
        richColors
        closeButton
        className="no-print"
      />
    </div>
  );
}

function MissingCharacter() {
  const { t } = useTranslation();
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
