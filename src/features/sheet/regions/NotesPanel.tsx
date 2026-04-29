import type { Character } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

export function NotesPanel({ character, onUpdate }: Props) {
  return (
    <SheetSectionFrame title="Notes" subtitle="Freeform chronicles and reminders">
      <label>
        Notes
        <textarea value={character.notes} onChange={(event) => onUpdate({ notes: event.target.value })} rows={6} />
      </label>
    </SheetSectionFrame>
  );
}
