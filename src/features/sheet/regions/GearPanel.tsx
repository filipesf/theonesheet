import type { Character } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import { SheetStatLozenge } from '../ui/SheetStatLozenge';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

export function GearPanel({ character, onUpdate }: Props) {
  return (
    <SheetSectionFrame title="Gear" subtitle="Fatigue and combat readiness" variant="resource">
      <div className="form-grid">
        <label>
          Fatigue
          <input type="number" value={character.fatigue} onChange={(event) => onUpdate({ fatigue: Number(event.target.value) })} />
        </label>
      </div>
      <div className="sheet-stat-row">
        <SheetStatLozenge label="Effective Parry" value={character.effective_parry} />
        <SheetStatLozenge label="Load" value={character.load} />
      </div>
    </SheetSectionFrame>
  );
}
