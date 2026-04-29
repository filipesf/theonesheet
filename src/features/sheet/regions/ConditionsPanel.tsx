import type { Character } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import { SheetStatLozenge } from '../ui/SheetStatLozenge';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

export function ConditionsPanel({ character, onUpdate }: Props) {
  return (
    <SheetSectionFrame title="Conditions" subtitle="Endurance, hope, and shadow" variant="resource">
      <div className="form-grid">
        <label>
          Current Endurance
          <input
            type="number"
            value={character.current_endurance}
            onChange={(event) => onUpdate({ current_endurance: Number(event.target.value) })}
          />
        </label>
        <label>
          Current Hope
          <input
            type="number"
            value={character.current_hope}
            onChange={(event) => onUpdate({ current_hope: Number(event.target.value) })}
          />
        </label>
        <label>
          Shadow
          <input type="number" value={character.shadow} onChange={(event) => onUpdate({ shadow: Number(event.target.value) })} />
        </label>
      </div>
      <div className="sheet-stat-row">
        <SheetStatLozenge label="Weary" value={character.conditions.weary ? 'Yes' : 'No'} />
        <SheetStatLozenge label="Miserable" value={character.conditions.miserable ? 'Yes' : 'No'} />
      </div>
    </SheetSectionFrame>
  );
}
