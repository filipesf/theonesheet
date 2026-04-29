import type { Character } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import { SheetStatLozenge } from '../ui/SheetStatLozenge';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

export function GearPanel({ character, onUpdate }: Props) {
  const warGear = character.war_gear;

  return (
    <SheetSectionFrame title="Gear" subtitle="Fatigue and combat readiness" variant="resource">
      <div className="form-grid">
        <label>
          Fatigue
          <input type="number" value={character.fatigue} onChange={(event) => onUpdate({ fatigue: Number(event.target.value) })} />
        </label>
        <label>
          Treasure
          <input type="number" value={character.treasure} onChange={(event) => onUpdate({ treasure: Number(event.target.value) })} />
        </label>
        <label>
          Armour
          <input
            value={warGear.armour?.type ?? ''}
            onChange={(event) =>
              onUpdate({
                war_gear: {
                  ...warGear,
                  armour: event.target.value.trim() ? { type: event.target.value.trim(), load: warGear.armour?.load ?? 0 } : null,
                },
              })
            }
            placeholder="e.g. Leather Shirt"
          />
        </label>
        <label>
          Armour Load
          <input
            type="number"
            value={warGear.armour?.load ?? 0}
            onChange={(event) =>
              onUpdate({
                war_gear: {
                  ...warGear,
                  armour: warGear.armour
                    ? { ...warGear.armour, load: Number(event.target.value) }
                    : { type: 'Armour', load: Number(event.target.value) },
                },
              })
            }
          />
        </label>
        <label>
          Helm Load
          <input
            type="number"
            value={warGear.helm?.load ?? 0}
            onChange={(event) =>
              onUpdate({
                war_gear: {
                  ...warGear,
                  helm: Number(event.target.value) > 0 ? { load: Number(event.target.value) } : null,
                },
              })
            }
          />
        </label>
        <label>
          Shield
          <input
            value={warGear.shield?.type ?? ''}
            onChange={(event) =>
              onUpdate({
                war_gear: {
                  ...warGear,
                  shield: event.target.value.trim()
                    ? {
                        type: event.target.value.trim(),
                        load: warGear.shield?.load ?? 0,
                        parry_bonus: warGear.shield?.parry_bonus ?? 0,
                        destroyed: warGear.shield?.destroyed ?? false,
                      }
                    : null,
                },
              })
            }
            placeholder="e.g. Shield"
          />
        </label>
        <label>
          Shield Load
          <input
            type="number"
            value={warGear.shield?.load ?? 0}
            onChange={(event) =>
              onUpdate({
                war_gear: {
                  ...warGear,
                  shield: warGear.shield
                    ? { ...warGear.shield, load: Number(event.target.value) }
                    : { type: 'Shield', load: Number(event.target.value), parry_bonus: 0, destroyed: false },
                },
              })
            }
          />
        </label>
        <label>
          Shield Parry Bonus
          <input
            type="number"
            value={warGear.shield?.parry_bonus ?? 0}
            onChange={(event) =>
              onUpdate({
                war_gear: {
                  ...warGear,
                  shield: warGear.shield
                    ? { ...warGear.shield, parry_bonus: Number(event.target.value) }
                    : { type: 'Shield', load: 0, parry_bonus: Number(event.target.value), destroyed: false },
                },
              })
            }
          />
        </label>
      </div>

      <div className="sheet-list-grid">
        {warGear.weapons.map((weapon, index) => (
          <div key={`${weapon.type}-${index}`} className="sheet-list-row">
            <input
              value={weapon.type}
              onChange={(event) => {
                const weapons = warGear.weapons.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, type: event.target.value } : item,
                );
                onUpdate({ war_gear: { ...warGear, weapons } });
              }}
              placeholder="Weapon"
            />
            <input
              type="number"
              value={weapon.load}
              onChange={(event) => {
                const weapons = warGear.weapons.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, load: Number(event.target.value) } : item,
                );
                onUpdate({ war_gear: { ...warGear, weapons } });
              }}
              placeholder="Load"
            />
            <button
              type="button"
              onClick={() => {
                const weapons = warGear.weapons.filter((_, itemIndex) => itemIndex !== index);
                onUpdate({ war_gear: { ...warGear, weapons } });
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="actions">
        <button
          type="button"
          onClick={() => onUpdate({ war_gear: { ...warGear, weapons: [...warGear.weapons, { type: 'Weapon', load: 0 }] } })}
        >
          Add weapon
        </button>
      </div>

      <label>
        Travelling Gear (comma-separated)
        <textarea
          rows={2}
          value={character.travelling_gear.join(', ')}
          onChange={(event) =>
            onUpdate({
              travelling_gear: event.target.value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </label>

      <label>
        Useful Items (description:skill, comma-separated)
        <textarea
          rows={2}
          value={character.useful_items.map((item) => `${item.description}:${item.associated_skill}`).join(', ')}
          onChange={(event) =>
            onUpdate({
              useful_items: event.target.value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item) => {
                  const [description, associatedSkill] = item.split(':').map((value) => value.trim());
                  return { description: description ?? '', associated_skill: associatedSkill ?? '' };
                }),
            })
          }
        />
      </label>

      <div className="sheet-stat-row">
        <SheetStatLozenge label="Effective Parry" value={character.effective_parry} />
        <SheetStatLozenge label="Load" value={character.load} />
      </div>
    </SheetSectionFrame>
  );
}
