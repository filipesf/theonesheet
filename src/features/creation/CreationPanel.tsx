import { getCreationValidationSummary } from './validation';
import type { Character } from '../../domain/types';

type Props = {
  character: Character;
  onApplyBelbaPreset: () => void;
};

export function CreationPanel({ character, onApplyBelbaPreset }: Props) {
  const summary = getCreationValidationSummary(character);

  return (
    <section className="editor-panel">
      <h3>Creation Workflow</h3>
      <p>Progressive helper for PRD creation phases 1-8 inside the single page.</p>
      <button type="button" onClick={onApplyBelbaPreset}>
        Apply Belba worked example baseline
      </button>

      <div className="creation-status-grid">
        <article>
          <h4>Blocking before finalise</h4>
          {summary.blocking.length === 0 ? <p>None</p> : summary.blocking.map((item) => <p key={item}>{item}</p>)}
        </article>
        <article>
          <h4>Draft warnings</h4>
          {summary.draftWarnings.length === 0 ? (
            <p>None</p>
          ) : (
            summary.draftWarnings.map((item) => <p key={item}>{item}</p>)
          )}
        </article>
      </div>

      <p>
        Finalisation status: <strong>{summary.canFinalise ? 'Ready' : 'Blocked'}</strong>
      </p>
    </section>
  );
}
