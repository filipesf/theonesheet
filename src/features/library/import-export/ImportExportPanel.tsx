type Props = {
  activeCharacterId: string | null;
  onExport: (id: string) => string | null;
  onImport: (json: string) => { ok: true } | { ok: false; error: string };
};

export function ImportExportPanel({ activeCharacterId, onExport, onImport }: Props) {
  return (
    <section className="editor-panel">
      <h3>Import / Export</h3>
      <div className="actions">
        <button
          type="button"
          onClick={() => {
            if (!activeCharacterId) {
              alert('Select a character first.');
              return;
            }
            const payload = onExport(activeCharacterId);
            if (!payload) {
              alert('Could not export this character.');
              return;
            }
            navigator.clipboard.writeText(payload).then(
              () => alert('Character JSON copied to clipboard.'),
              () => alert('Clipboard copy failed. Please try again.'),
            );
          }}
        >
          Export active character
        </button>
        <button
          type="button"
          onClick={() => {
            const input = prompt('Paste character export JSON');
            if (!input) {
              return;
            }
            const result = onImport(input);
            if (!result.ok) {
              alert(result.error);
              return;
            }
            alert('Character imported successfully.');
          }}
        >
          Import character JSON
        </button>
      </div>
    </section>
  );
}
