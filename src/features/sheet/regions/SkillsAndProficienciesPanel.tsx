import type { Character, CombatProficiency, Skill } from '../../../domain/types';
import { SheetSectionFrame } from '../ui/SheetSectionFrame';
import type { UpdateCharacter } from './types';

type Props = {
  character: Character;
  onUpdate: UpdateCharacter;
};

const SKILL_CATEGORIES: Array<Skill['category']> = ['STRENGTH', 'HEART', 'WITS'];

function updateSkill(character: Character, skillName: string, patch: Partial<Skill>): Skill[] {
  return character.skills.map((skill) => (skill.name === skillName ? { ...skill, ...patch } : skill));
}

function updateProficiency(
  character: Character,
  proficiencyName: CombatProficiency['name'],
  rating: number,
): CombatProficiency[] {
  return character.combat_proficiencies.map((proficiency) =>
    proficiency.name === proficiencyName ? { ...proficiency, rating } : proficiency,
  );
}

export function SkillsAndProficienciesPanel({ character, onUpdate }: Props) {
  return (
    <>
      <SheetSectionFrame title="Skills" subtitle="Ratings by attribute with favoured mark">
        <div className="sheet-skills-grid">
          {SKILL_CATEGORIES.map((category) => (
            <section key={category} className="sheet-skill-column">
              <h4>{category}</h4>
              {character.skills
                .filter((skill) => skill.category === category)
                .map((skill) => (
                  <div key={skill.name} className="sheet-skill-row">
                    <span>{skill.name}</span>
                    <input
                      type="number"
                      min={0}
                      max={6}
                      value={skill.rating}
                      onChange={(event) =>
                        onUpdate({ skills: updateSkill(character, skill.name, { rating: Number(event.target.value) }) })
                      }
                    />
                    <label className="favoured-toggle">
                      <input
                        type="checkbox"
                        checked={skill.favoured}
                        onChange={(event) =>
                          onUpdate({ skills: updateSkill(character, skill.name, { favoured: event.target.checked }) })
                        }
                      />
                      Favoured
                    </label>
                  </div>
                ))}
            </section>
          ))}
        </div>
      </SheetSectionFrame>

      <SheetSectionFrame title="Combat Proficiencies" subtitle="Axes, bows, spears, and swords" variant="resource">
        <div className="sheet-proficiencies-grid">
          {character.combat_proficiencies.map((proficiency) => (
            <label key={proficiency.name}>
              {proficiency.name}
              <input
                type="number"
                min={0}
                max={6}
                value={proficiency.rating}
                onChange={(event) =>
                  onUpdate({
                    combat_proficiencies: updateProficiency(character, proficiency.name, Number(event.target.value)),
                  })
                }
              />
            </label>
          ))}
        </div>
      </SheetSectionFrame>
    </>
  );
}
