import type { Character } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

export function IdentityHeader({ character, onUpdate }: Props) {
  return (
    <SheetSectionFrame title="Identity" subtitle="Name and life details">
      <div className="form-grid">
        <label>
          Name
          <input value={character.name} onChange={(event) => onUpdate({ name: event.target.value })} />
        </label>
        <label>
          Age
          <input
            type="number"
            value={character.age}
            onChange={(event) => onUpdate({ age: Number(event.target.value) })}
          />
        </label>
      </div>
    </SheetSectionFrame>
  );
}
