import { useMemo } from 'react';
import { normaliseCharacter } from '../../../domain/normalise';
import { validateCharacter } from '../../../domain/validate';
import type { Character } from '../../../domain/types';
import type { SheetSection } from '../SheetTabs';

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
    <section className="editor-panel">
      {issues.length > 0 && (
        <div className="inline-errors">
          {issues.map((issue) => (
            <p key={`${issue.field}-${issue.message}`}>{issue.field}: {issue.message}</p>
          ))}
        </div>
      )}

      {section === 'identity' && (
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
      )}

      {section === 'attributes' && (
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
          <label>
            TN Strength (derived)
            <input readOnly value={character.attributes.tn_strength} className="readonly" />
          </label>
          <label>
            TN Heart (derived)
            <input readOnly value={character.attributes.tn_heart} className="readonly" />
          </label>
          <label>
            TN Wits (derived)
            <input readOnly value={character.attributes.tn_wits} className="readonly" />
          </label>
        </div>
      )}

      {section === 'gear' && (
        <div className="form-grid">
          <label>
            Fatigue
            <input
              type="number"
              value={character.fatigue}
              onChange={(event) => update({ fatigue: Number(event.target.value) })}
            />
          </label>
          <label>
            Effective Parry (derived)
            <input readOnly value={character.effective_parry} className="readonly" />
          </label>
          <label>
            Load (derived)
            <input readOnly value={character.load} className="readonly" />
          </label>
        </div>
      )}

      {section === 'conditions' && (
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
          <label>
            Weary (derived)
            <input readOnly value={character.conditions.weary ? 'Yes' : 'No'} className="readonly" />
          </label>
          <label>
            Miserable (derived)
            <input readOnly value={character.conditions.miserable ? 'Yes' : 'No'} className="readonly" />
          </label>
        </div>
      )}

      {section === 'skills' && <p>Skills editor arrives in Phase 3.</p>}
      {section === 'rewards' && <p>Rewards and virtues editor arrives in Phase 3.</p>}
      {section === 'notes' && (
        <label>
          Notes
          <textarea value={character.notes} onChange={(event) => update({ notes: event.target.value })} rows={6} />
        </label>
      )}
    </section>
  );
}
