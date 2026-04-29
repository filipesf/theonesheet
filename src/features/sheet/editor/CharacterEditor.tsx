import { useMemo } from 'react';
import { normaliseCharacter } from '../../../domain/normalise';
import { validateCharacter } from '../../../domain/validate';
import type { Character } from '../../../domain/types';
import type { SheetSection } from '../SheetTabs';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import { SheetStatLozenge } from '../ui/SheetStatLozenge';

type Props = {
  character: Character;
  section: SheetSection;
  onChange: (character: Character) => void;
};

export function CharacterEditor({ character, section, onChange }: Props) {
  const issues = useMemo(() => validateCharacter(character), [character]);

  function update(partial: Partial<Character>) {
    onChange(normaliseCharacter({ ...character, ...partial }));
  }

  return (
    <section className="editor-panel sheet-editor-panel">
      {issues.length > 0 && (
        <div className="inline-errors">
          {issues.map((issue) => (
            <p key={`${issue.field}-${issue.message}`}>{issue.field}: {issue.message}</p>
          ))}
        </div>
      )}

      {section === 'identity' && (
        <SheetSectionFrame title="Identity" subtitle="Name and life details">
          <div className="form-grid">
            <label>
              Name
              <input
                value={character.name}
                onChange={(event) => update({ name: event.target.value })}
              />
            </label>
            <label>
              Age
              <input
                type="number"
                value={character.age}
                onChange={(event) => update({ age: Number(event.target.value) })}
              />
            </label>
          </div>
        </SheetSectionFrame>
      )}

      {section === 'attributes' && (
        <SheetSectionFrame title="Attributes" subtitle="Core ratings and target numbers" variant="attribute">
          <div className="form-grid">
            <label>
              Strength
              <input
                type="number"
                value={character.attributes.strength}
                onChange={(event) =>
                  update({
                    attributes: { ...character.attributes, strength: Number(event.target.value) },
                  })
                }
              />
            </label>
            <label>
              Heart
              <input
                type="number"
                value={character.attributes.heart}
                onChange={(event) =>
                  update({
                    attributes: { ...character.attributes, heart: Number(event.target.value) },
                  })
                }
              />
            </label>
            <label>
              Wits
              <input
                type="number"
                value={character.attributes.wits}
                onChange={(event) =>
                  update({
                    attributes: { ...character.attributes, wits: Number(event.target.value) },
                  })
                }
              />
            </label>
          </div>
          <div className="sheet-stat-row">
            <SheetStatLozenge label="TN Strength" value={character.attributes.tn_strength} />
            <SheetStatLozenge label="TN Heart" value={character.attributes.tn_heart} />
            <SheetStatLozenge label="TN Wits" value={character.attributes.tn_wits} />
          </div>
        </SheetSectionFrame>
      )}

      {section === 'gear' && (
        <SheetSectionFrame title="Gear" subtitle="Fatigue and combat readiness" variant="resource">
          <div className="form-grid">
            <label>
              Fatigue
              <input
                type="number"
                value={character.fatigue}
                onChange={(event) => update({ fatigue: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="sheet-stat-row">
            <SheetStatLozenge label="Effective Parry" value={character.effective_parry} />
            <SheetStatLozenge label="Load" value={character.load} />
          </div>
        </SheetSectionFrame>
      )}

      {section === 'conditions' && (
        <SheetSectionFrame title="Conditions" subtitle="Endurance, hope, and shadow" variant="resource">
          <div className="form-grid">
            <label>
              Current Endurance
              <input
                type="number"
                value={character.current_endurance}
                onChange={(event) => update({ current_endurance: Number(event.target.value) })}
              />
            </label>
            <label>
              Current Hope
              <input
                type="number"
                value={character.current_hope}
                onChange={(event) => update({ current_hope: Number(event.target.value) })}
              />
            </label>
            <label>
              Shadow
              <input
                type="number"
                value={character.shadow}
                onChange={(event) => update({ shadow: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="sheet-stat-row">
            <SheetStatLozenge label="Weary" value={character.conditions.weary ? 'Yes' : 'No'} />
            <SheetStatLozenge label="Miserable" value={character.conditions.miserable ? 'Yes' : 'No'} />
          </div>
        </SheetSectionFrame>
      )}

      {section === 'skills' && <p>Skills editor arrives in Phase 3.</p>}
      {section === 'rewards' && <p>Rewards and virtues editor arrives in Phase 3.</p>}
      {section === 'notes' && (
        <SheetSectionFrame title="Notes" subtitle="Freeform chronicles and reminders">
          <label>
            Notes
            <textarea value={character.notes} onChange={(event) => update({ notes: event.target.value })} rows={6} />
          </label>
        </SheetSectionFrame>
      )}
    </section>
  );
}
