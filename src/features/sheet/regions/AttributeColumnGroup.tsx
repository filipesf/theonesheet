import type { Character } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import { SheetStatLozenge } from '../ui/SheetStatLozenge';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

export function AttributeColumnGroup({ character, onUpdate }: Props) {
  return (
    <SheetSectionFrame title="Attributes" subtitle="Core ratings and target numbers" variant="attribute">
      <div className="form-grid">
        <label>
          Strength
          <input
            type="number"
            value={character.attributes.strength}
            onChange={(event) =>
              onUpdate({
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
              onUpdate({
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
              onUpdate({
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
  );
}
