import type { Character, Reward, Virtue } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

function parseRewards(input: string): Reward[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name, origin: 'STANDARD' as const }));
}

function parseVirtues(input: string): Virtue[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((name) => ({ name, origin: 'STANDARD' as const }));
}

export function RewardsVirtuesPanel({ character, onUpdate }: Props) {
  return (
    <SheetSectionFrame title="Rewards and Virtues" subtitle="Progression and fellowship context">
      <div className="form-grid">
        <label>
          Valour
          <input type="number" min={1} max={6} value={character.valour} onChange={(event) => onUpdate({ valour: Number(event.target.value) })} />
        </label>
        <label>
          Wisdom
          <input type="number" min={1} max={6} value={character.wisdom} onChange={(event) => onUpdate({ wisdom: Number(event.target.value) })} />
        </label>
        <label>
          Shadow Scars
          <input
            type="number"
            min={0}
            value={character.shadow_scars}
            onChange={(event) => onUpdate({ shadow_scars: Number(event.target.value) })}
          />
        </label>
        <label>
          Fellowship Focus ID
          <input value={character.fellowship_focus_id ?? ''} onChange={(event) => onUpdate({ fellowship_focus_id: event.target.value || null })} />
        </label>
      </div>

      <label>
        Rewards (comma-separated)
        <textarea rows={2} value={character.rewards.map((reward) => reward.name).join(', ')} onChange={(event) => onUpdate({ rewards: parseRewards(event.target.value) })} />
      </label>

      <label>
        Virtues (comma-separated)
        <textarea rows={2} value={character.virtues.map((virtue) => virtue.name).join(', ')} onChange={(event) => onUpdate({ virtues: parseVirtues(event.target.value) })} />
      </label>
    </SheetSectionFrame>
  );
}
