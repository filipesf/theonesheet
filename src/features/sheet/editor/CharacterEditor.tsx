import { useMemo } from 'react';
import { normaliseCharacter } from '../../../domain/normalise';
import { validateCharacter } from '../../../domain/validate';
import type { Character } from '../../../domain/types';
import type { SheetSection } from '../SheetTabs';
import { AttributeColumnGroup } from '../regions/AttributeColumnGroup';
import { ConditionsPanel } from '../regions/ConditionsPanel';
import { GearPanel } from '../regions/GearPanel';
import { IdentityHeader } from '../regions/IdentityHeader';
import { NotesPanel } from '../regions/NotesPanel';
import { RewardsVirtuesPanel } from '../regions/RewardsVirtuesPanel';
import { SkillsAndProficienciesPanel } from '../regions/SkillsAndProficienciesPanel';

type Props = {
  character: Character;
  section: SheetSection;
  onChange: (character: Character) => void;
};

export function CharacterEditor({ character, section, onChange }: Props) {
  const issues = useMemo(() => validateCharacter(character), [character]);
  const showSectionOnly = section !== 'creation';

  function update(partial: Partial<Character>) {
    onChange(normaliseCharacter({ ...character, ...partial }));
  }

  return (
    <section className="editor-panel sheet-editor-panel">
      {issues.length > 0 && (
        <div className="inline-errors validation-panel" role="alert" aria-live="polite">
          <p className="validation-title">Validation issues ({issues.length})</p>
          {issues.map((issue) => (
            <p key={`${issue.field}-${issue.message}`}>{issue.field}: {issue.message}</p>
          ))}
        </div>
      )}

      {showSectionOnly ? (
        <div className="sheet-region-grid">
          {section === 'identity' && <IdentityHeader character={character} onUpdate={update} />}
          {section === 'attributes' && <AttributeColumnGroup character={character} onUpdate={update} />}
          {section === 'conditions' && <ConditionsPanel character={character} onUpdate={update} />}
          {section === 'gear' && <GearPanel character={character} onUpdate={update} />}
          {section === 'rewards' && <RewardsVirtuesPanel character={character} onUpdate={update} />}
          {section === 'notes' && <NotesPanel character={character} onUpdate={update} />}
          {section === 'skills' && <SkillsAndProficienciesPanel character={character} onUpdate={update} />}
        </div>
      ) : (
        <div className="sheet-region-grid">
          <IdentityHeader character={character} onUpdate={update} />
          <AttributeColumnGroup character={character} onUpdate={update} />
          <SkillsAndProficienciesPanel character={character} onUpdate={update} />
          <ConditionsPanel character={character} onUpdate={update} />
          <GearPanel character={character} onUpdate={update} />
          <RewardsVirtuesPanel character={character} onUpdate={update} />
          <NotesPanel character={character} onUpdate={update} />
        </div>
      )}
    </section>
  );
}
