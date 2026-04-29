import { normaliseCharacter } from '../../domain/normalise';
import type { Character, Skill } from '../../domain/types';

type Props = {
  character: Character;
  onChange: (character: Character) => void;
};

const SKILL_GROUPS: Record<Skill['category'], string> = {
  STRENGTH: 'Strength',
  HEART: 'Heart',
  WITS: 'Wits',
};

function range(max: number): number[] {
  return Array.from({ length: max }, (_, index) => index + 1);
}

export function PrintedCharacterSheet({ character, onChange }: Props) {
  function update(patch: Partial<Character>) {
    onChange(normaliseCharacter({ ...character, ...patch }));
  }

  function updateSkill(name: string, patch: Partial<Skill>) {
    update({
      skills: character.skills.map((skill) => (skill.name === name ? { ...skill, ...patch } : skill)),
    });
  }

  return (
    <section className="tor-sheet" aria-label="The One Ring character sheet">
      <header className="tor-name-banner">
        <p>Name</p>
        <input value={character.name} onChange={(event) => update({ name: event.target.value })} />
      </header>

      <section className="tor-identity-grid">
        <label>
          Heroic Culture
          <input value={character.heroic_culture} onChange={(event) => update({ heroic_culture: event.target.value as Character['heroic_culture'] })} />
        </label>
        <label>
          Age
          <input type="number" value={character.age} onChange={(event) => update({ age: Number(event.target.value) })} />
        </label>
        <label>
          Standard of Living
          <input value={character.standard_of_living} onChange={(event) => update({ standard_of_living: event.target.value as Character['standard_of_living'] })} />
        </label>
        <label>
          Treasure
          <input type="number" value={character.treasure} onChange={(event) => update({ treasure: Number(event.target.value) })} />
        </label>
        <label className="tor-span-2">
          Distinctive Features
          <input
            value={character.distinctive_features.join(', ')}
            onChange={(event) => update({ distinctive_features: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })}
          />
        </label>
        <label>
          Cultural Blessing
          <input value={character.cultural_blessing} onChange={(event) => update({ cultural_blessing: event.target.value })} />
        </label>
        <label>
          Patron
          <input value={character.company_id} onChange={(event) => update({ company_id: event.target.value })} />
        </label>
        <label className="tor-span-2">
          Flaws
          <input value={character.flaws.join(', ')} onChange={(event) => update({ flaws: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
        </label>
        <label>
          Calling
          <input value={character.calling} onChange={(event) => update({ calling: event.target.value as Character['calling'] })} />
        </label>
        <label>
          Shadow Path
          <input value={character.shadow_path} onChange={(event) => update({ shadow_path: event.target.value })} />
        </label>
      </section>

      <section className="tor-main-grid">
        {(['STRENGTH', 'HEART', 'WITS'] as const).map((category) => {
          const ratingField = category === 'STRENGTH' ? 'strength' : category === 'HEART' ? 'heart' : 'wits';
          const tnField = category === 'STRENGTH' ? 'tn_strength' : category === 'HEART' ? 'tn_heart' : 'tn_wits';
          const derived = category === 'STRENGTH' ? character.max_endurance : category === 'HEART' ? character.max_hope : character.effective_parry;
          const derivedLabel = category === 'STRENGTH' ? 'Endurance' : category === 'HEART' ? 'Hope' : 'Parry';
          return (
            <section className="tor-attr-column" key={category}>
              <h3>{SKILL_GROUPS[category]}</h3>
              <div className="tor-diamond-cluster">
                <label>
                  TN
                  <input readOnly value={character.attributes[tnField]} />
                </label>
                <label>
                  Rating
                  <input
                    type="number"
                    value={character.attributes[ratingField]}
                    onChange={(event) =>
                      update({ attributes: { ...character.attributes, [ratingField]: Number(event.target.value) } })
                    }
                  />
                </label>
                <label>
                  {derivedLabel}
                  <input readOnly value={derived} />
                </label>
              </div>
              <div className="tor-skill-list">
                {character.skills
                  .filter((skill) => skill.category === category)
                  .map((skill) => (
                    <div key={skill.name} className="tor-skill-row">
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        className={`tor-fav ${skill.favoured ? 'is-on' : ''}`}
                        onClick={() => updateSkill(skill.name, { favoured: !skill.favoured })}
                        aria-label={`Toggle favoured for ${skill.name}`}
                      />
                      <div className="tor-pips">
                        {range(6).map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={`tor-pip ${skill.rating >= value ? 'is-on' : ''}`}
                            onClick={() => updateSkill(skill.name, { rating: value })}
                            aria-label={`${skill.name} rating ${value}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          );
        })}

        <aside className="tor-side-column">
          <div className="tor-portrait" aria-hidden="true" />
          <div className="tor-side-points">
            <label>Adventure Points<input type="number" value={character.experience.adventure_points} onChange={(event) => update({ experience: { ...character.experience, adventure_points: Number(event.target.value) } })} /></label>
            <label>Skill Points<input type="number" value={character.experience.skill_points} onChange={(event) => update({ experience: { ...character.experience, skill_points: Number(event.target.value) } })} /></label>
            <label>Fellowship Score<input type="number" value={character.valour + character.wisdom} readOnly /></label>
          </div>
          <div className="tor-condition-boxes">
            <label>Current Endurance<input type="number" value={character.current_endurance} onChange={(event) => update({ current_endurance: Number(event.target.value) })} /></label>
            <label>Current Hope<input type="number" value={character.current_hope} onChange={(event) => update({ current_hope: Number(event.target.value) })} /></label>
            <label>Shadow<input type="number" value={character.shadow} onChange={(event) => update({ shadow: Number(event.target.value) })} /></label>
            <label>Load<input type="number" value={character.load} readOnly /></label>
            <label>Fatigue<input type="number" value={character.fatigue} onChange={(event) => update({ fatigue: Number(event.target.value) })} /></label>
            <label>Shadow Scars<input type="number" value={character.shadow_scars} onChange={(event) => update({ shadow_scars: Number(event.target.value) })} /></label>
          </div>
          <div className="tor-conditions-checks">
            <h4>Conditions</h4>
            <label><input type="checkbox" checked={character.conditions.weary} readOnly />Weary</label>
            <label><input type="checkbox" checked={character.conditions.miserable} readOnly />Miserable</label>
            <label><input type="checkbox" checked={character.conditions.wounded} onChange={(event) => update({ conditions: { ...character.conditions, wounded: event.target.checked } })} />Wounded</label>
          </div>
          <label>
            Travelling Gear
            <textarea rows={4} value={character.travelling_gear.join('\n')} onChange={(event) => update({ travelling_gear: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} />
          </label>
        </aside>
      </section>
    </section>
  );
}
