import type { ChangeEvent, ReactNode } from 'react';
import { normaliseCharacter } from '../../domain/normalise';
import {
  CALLINGS,
  HEROIC_CULTURES,
  STANDARD_OF_LIVING,
} from '../../domain/types';
import type { Character, Skill } from '../../domain/types';
import {
  CALLING_LABELS,
  HEROIC_CULTURE_LABELS,
  PATRONS,
  STANDARD_OF_LIVING_LABELS,
  resolvePatronName,
} from '../../ref-data/labels';
import { ConditionCheck } from './ui/ConditionCheck';
import { Diamond, DiamondLabel } from './ui/Diamond';
import { FavouredCheck } from './ui/FavouredCheck';
import { PipRow } from './ui/Pip';

type Props = {
  character: Character;
  onChange: (character: Character) => void;
};

const CATEGORY_TITLE: Record<Skill['category'], string> = {
  STRENGTH: 'Strength',
  HEART: 'Heart',
  WITS: 'Wits',
};

const COMBAT_PROFICIENCY_LABELS: Record<'AXES' | 'BOWS' | 'SPEARS' | 'SWORDS', string> = {
  AXES: 'Axes',
  BOWS: 'Bows',
  SPEARS: 'Spears',
  SWORDS: 'Swords',
};

const CATEGORY_DERIVED: Record<
  Skill['category'],
  {
    ratingField: 'strength' | 'heart' | 'wits';
    tnField: 'tn_strength' | 'tn_heart' | 'tn_wits';
    derivedLabel: string;
  }
> = {
  STRENGTH: { ratingField: 'strength', tnField: 'tn_strength', derivedLabel: 'Endurance' },
  HEART: { ratingField: 'heart', tnField: 'tn_heart', derivedLabel: 'Hope' },
  WITS: { ratingField: 'wits', tnField: 'tn_wits', derivedLabel: 'Parry' },
};

function joinList(values: readonly string[]): string {
  return values.join(', ');
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PrintedCharacterSheet({ character, onChange }: Props) {
  function update(patch: Partial<Character>) {
    onChange(normaliseCharacter({ ...character, ...patch }));
  }

  function updateSkill(name: string, patch: Partial<Skill>) {
    update({
      skills: character.skills.map((skill) =>
        skill.name === name ? { ...skill, ...patch } : skill,
      ),
    });
  }

  function updateProficiency(name: 'AXES' | 'BOWS' | 'SPEARS' | 'SWORDS', rating: number) {
    update({
      combat_proficiencies: character.combat_proficiencies.map((proficiency) =>
        proficiency.name === name ? { ...proficiency, rating } : proficiency,
      ),
    });
  }

  function updateAttribute(field: 'strength' | 'heart' | 'wits', value: number) {
    update({ attributes: { ...character.attributes, [field]: value } });
  }

  const fellowshipScore = character.valour + character.wisdom;
  const totalLoad = character.load;
  const patronValue = PATRONS.some((p) => p.id === character.company_id)
    ? character.company_id
    : '';

  return (
    <article
      className="sheet relative w-full max-w-[1500px] mx-auto bg-parchment border-2 border-ink-red shadow-[0_2px_24px_-12px_rgba(31,44,92,0.4)]"
      aria-label="The One Ring character sheet"
    >
      <div className="border border-ink-red p-5 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_236px] gap-6 lg:gap-8">
          <div className="flex flex-col gap-6 min-w-0">
            <NameCartouche
              value={character.name}
              onChange={(value) => update({ name: value })}
            />
            <IdentityStrip
              character={character}
              patronValue={patronValue}
              onChange={update}
            />
            <AttributeClusters character={character} onUpdateAttribute={updateAttribute} />
            <SkillsSection character={character} updateSkill={updateSkill} />
            <ProfRewardsVirtuesBand
              character={character}
              updateProficiency={updateProficiency}
              update={update}
            />
            <WarGearArmourBand character={character} />
          </div>
          <RightSidebar
            character={character}
            fellowshipScore={fellowshipScore}
            totalLoad={totalLoad}
            update={update}
          />
        </div>
      </div>
    </article>
  );
}

// --- Top of sheet ---------------------------------------------------------

function NameCartouche({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <header className="border-2 border-ink-red px-4 pt-2 pb-3 text-center">
      <span className="font-label text-[10px] tracking-[0.25em] uppercase text-ink-red">
        Name
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter your hero's name…"
        aria-label="Character name"
        className="block w-full bg-transparent border-0 outline-none text-center font-hand text-3xl sm:text-4xl text-ink-navy placeholder:text-ink-navy/30"
      />
    </header>
  );
}

function IdentityStrip({
  character,
  patronValue,
  onChange,
}: {
  character: Character;
  patronValue: string;
  onChange: (patch: Partial<Character>) => void;
}) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
      <div className="flex flex-col gap-3">
        <SelectField
          label="Heroic Culture"
          value={character.heroic_culture}
          options={HEROIC_CULTURES.map((culture) => ({
            value: culture,
            label: HEROIC_CULTURE_LABELS[culture],
          }))}
          onChange={(value) => onChange({ heroic_culture: value as Character['heroic_culture'] })}
        />
        <TextField
          label="Cultural Blessing"
          value={character.cultural_blessing}
          onChange={(value) => onChange({ cultural_blessing: value })}
        />
        <SelectField
          label="Calling"
          value={character.calling}
          options={CALLINGS.map((calling) => ({
            value: calling,
            label: CALLING_LABELS[calling],
          }))}
          onChange={(value) => onChange({ calling: value as Character['calling'] })}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[60px_minmax(0,1fr)_72px] gap-3 items-end">
          <NumberField
            label="Age"
            value={character.age}
            onChange={(value) => onChange({ age: value })}
          />
          <SelectField
            label="Standard of Living"
            value={character.standard_of_living}
            options={STANDARD_OF_LIVING.map((value) => ({
              value,
              label: STANDARD_OF_LIVING_LABELS[value],
            }))}
            onChange={(value) =>
              onChange({ standard_of_living: value as Character['standard_of_living'] })
            }
          />
          <div className="flex flex-col items-center gap-1">
            <DiamondLabel>Treasure</DiamondLabel>
            <Diamond size="md">
              <input
                type="number"
                value={character.treasure}
                onChange={(event) =>
                  onChange({ treasure: Number(event.target.value) || 0 })
                }
                aria-label="Treasure"
                className="w-10 bg-transparent border-0 outline-none text-center font-hand text-xl text-ink-navy"
              />
            </Diamond>
          </div>
        </div>
        <SelectField
          label="Patron"
          value={patronValue}
          options={[
            { value: '', label: '—' },
            ...PATRONS.map((p) => ({ value: p.id, label: p.name })),
          ]}
          onChange={(value) => onChange({ company_id: value })}
          displayFallback={resolvePatronName(character.company_id)}
        />
        <TextField
          label="Shadow Path"
          value={character.shadow_path}
          onChange={(value) => onChange({ shadow_path: value })}
        />
      </div>
      <div className="flex flex-col gap-3">
        <TextField
          label="Distinctive Features"
          value={joinList(character.distinctive_features)}
          onChange={(value) => onChange({ distinctive_features: splitList(value) })}
          placeholder="Patient, Rustic, Folk-lore"
        />
        <TextField
          label="Flaws"
          value={joinList(character.flaws)}
          onChange={(value) => onChange({ flaws: splitList(value) })}
          placeholder="—"
        />
      </div>
    </section>
  );
}

// --- Attribute clusters ---------------------------------------------------

function AttributeClusters({
  character,
  onUpdateAttribute,
}: {
  character: Character;
  onUpdateAttribute: (field: 'strength' | 'heart' | 'wits', value: number) => void;
}) {
  return (
    <section className="grid grid-cols-3 gap-6 sm:gap-8">
      {(['STRENGTH', 'HEART', 'WITS'] as const).map((category) => {
        const meta = CATEGORY_DERIVED[category];
        const tn = character.attributes[meta.tnField];
        const rating = character.attributes[meta.ratingField];
        const derived =
          category === 'STRENGTH'
            ? character.max_endurance
            : category === 'HEART'
              ? character.max_hope
              : character.effective_parry;
        return (
          <div key={category} className="flex flex-col items-center gap-3">
            <h3 className="font-display text-xl tracking-[0.22em] uppercase text-ink-red">
              {CATEGORY_TITLE[category]}
            </h3>
            <AttributeCluster
              tn={tn}
              rating={rating}
              derived={derived}
              derivedLabel={meta.derivedLabel}
              onChangeRating={(value) => onUpdateAttribute(meta.ratingField, value)}
            />
          </div>
        );
      })}
    </section>
  );
}

function AttributeCluster({
  tn,
  rating,
  derived,
  derivedLabel,
  onChangeRating,
}: {
  tn: number;
  rating: number;
  derived: number;
  derivedLabel: string;
  onChangeRating: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-[auto_auto] gap-x-3 items-center">
      <div className="flex flex-col items-center gap-1.5">
        <Diamond size="lg">{tn}</Diamond>
        <DiamondLabel>TN</DiamondLabel>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Diamond size="md">
            <input
              type="number"
              value={rating}
              onChange={(event) => onChangeRating(Number(event.target.value) || 0)}
              aria-label={`${derivedLabel === 'Endurance' ? 'Strength' : derivedLabel === 'Hope' ? 'Heart' : 'Wits'} rating`}
              className="w-10 bg-transparent border-0 outline-none text-center font-hand text-2xl text-ink-navy"
            />
          </Diamond>
          <DiamondLabel>Rating</DiamondLabel>
        </div>
        <div className="flex items-center gap-2">
          <Diamond size="md">{derived}</Diamond>
          <DiamondLabel>{derivedLabel}</DiamondLabel>
        </div>
      </div>
    </div>
  );
}

// --- Skills ---------------------------------------------------------------

function SkillsSection({
  character,
  updateSkill,
}: {
  character: Character;
  updateSkill: (name: string, patch: Partial<Skill>) => void;
}) {
  return (
    <section>
      <SectionHeader>Skills</SectionHeader>
      <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-4">
        {(['STRENGTH', 'HEART', 'WITS'] as const).map((category) => (
          <ul key={category} className="flex flex-col gap-1.5">
            {character.skills
              .filter((skill) => skill.category === category)
              .map((skill) => (
                <li
                  key={skill.name}
                  className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-3 border-b border-ink-red/30 py-1"
                >
                  <FavouredCheck
                    checked={skill.favoured}
                    onChange={() =>
                      updateSkill(skill.name, { favoured: !skill.favoured })
                    }
                    label={skill.name}
                  />
                  <span className="font-body text-base text-ink-navy truncate">
                    {skill.name}
                  </span>
                  <PipRow
                    rating={skill.rating}
                    onChange={(rating) => updateSkill(skill.name, { rating })}
                    label={skill.name}
                  />
                </li>
              ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

// --- Combat / Rewards / Virtues ------------------------------------------

function ProfRewardsVirtuesBand({
  character,
  updateProficiency,
  update,
}: {
  character: Character;
  updateProficiency: (name: 'AXES' | 'BOWS' | 'SPEARS' | 'SWORDS', rating: number) => void;
  update: (patch: Partial<Character>) => void;
}) {
  return (
    <section className="grid grid-cols-3 gap-6 sm:gap-8">
      <div>
        <SectionHeader>Combat Proficiencies</SectionHeader>
        <ul className="flex flex-col gap-1.5 pt-4">
          {character.combat_proficiencies.map((proficiency) => (
            <li
              key={proficiency.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ink-red/30 py-1"
            >
              <span className="font-body text-base text-ink-navy">
                {COMBAT_PROFICIENCY_LABELS[proficiency.name]}
              </span>
              <PipRow
                rating={proficiency.rating}
                onChange={(rating) => updateProficiency(proficiency.name, rating)}
                label={proficiency.name}
              />
            </li>
          ))}
        </ul>
      </div>

      <RewardLikeColumn
        title="Rewards"
        statLabel="Valour"
        statValue={character.valour}
        onStatChange={(value) => update({ valour: value })}
        items={character.rewards.map((r) => r.name)}
      />
      <RewardLikeColumn
        title="Virtues"
        statLabel="Wisdom"
        statValue={character.wisdom}
        onStatChange={(value) => update({ wisdom: value })}
        items={character.virtues.map((v) => v.name)}
      />
    </section>
  );
}

function RewardLikeColumn({
  title,
  statLabel,
  statValue,
  onStatChange,
  items,
}: {
  title: string;
  statLabel: string;
  statValue: number;
  onStatChange: (value: number) => void;
  items: string[];
}) {
  return (
    <div>
      <header className="relative border-t border-ink-red flex items-center justify-between gap-3 -mt-2">
        <span className="bg-parchment pl-1 pr-3 font-display text-sm tracking-[0.22em] uppercase text-ink-red">
          {title}
        </span>
        <div className="bg-parchment pl-2 flex items-center gap-2 -mt-3">
          <DiamondLabel>{statLabel}</DiamondLabel>
          <Diamond size="md">
            <input
              type="number"
              value={statValue}
              onChange={(event) => onStatChange(Number(event.target.value) || 0)}
              aria-label={statLabel}
              className="w-10 bg-transparent border-0 outline-none text-center font-hand text-xl text-ink-navy"
            />
          </Diamond>
        </div>
      </header>
      <ul className="pt-4 flex flex-col gap-1 min-h-[96px]">
        {items.length === 0 && (
          <li className="font-body text-sm text-ink-navy/40 italic">
            None recorded
          </li>
        )}
        {items.map((label, index) => (
          <li
            key={`${label}-${index}`}
            className="font-hand text-lg text-ink-navy border-b border-ink-red/30 pb-0.5"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Gear band -----------------------------------------------------------

function WarGearArmourBand({ character }: { character: Character }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      <WarGearPanel character={character} />
      <ArmourPanel character={character} />
    </section>
  );
}

function WarGearPanel({ character }: { character: Character }) {
  return (
    <div>
      <SectionHeader>War Gear</SectionHeader>
      <table className="w-full mt-3 text-left">
        <thead>
          <tr className="font-label text-[9px] tracking-wider uppercase text-ink-red/85">
            <th className="font-normal pb-1">Weapon</th>
            <th className="font-normal pb-1 text-center">Damage</th>
            <th className="font-normal pb-1 text-center">Injury</th>
            <th className="font-normal pb-1 text-center">Load</th>
            <th className="font-normal pb-1">Notes</th>
          </tr>
        </thead>
        <tbody>
          {character.war_gear.weapons.length === 0 && (
            <tr>
              <td colSpan={5} className="font-body text-sm text-ink-navy/40 italic py-2">
                No weapons equipped
              </td>
            </tr>
          )}
          {character.war_gear.weapons.map((weapon, index) => (
            <tr key={`${weapon.type}-${index}`} className="border-b border-ink-red/30">
              <td className="font-hand text-lg text-ink-navy py-0.5">{weapon.type}</td>
              <td className="font-hand text-lg text-ink-navy text-center">—</td>
              <td className="font-hand text-lg text-ink-navy text-center">—</td>
              <td className="font-hand text-lg text-ink-navy text-center">{weapon.load}</td>
              <td className="font-hand text-lg text-ink-navy" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArmourPanel({ character }: { character: Character }) {
  return (
    <div>
      <SectionHeader>Armour</SectionHeader>
      <div className="mt-3 flex flex-col gap-2">
        <ArmourRow
          label="Armour"
          type={character.war_gear.armour?.type ?? ''}
          secondaryLabel="Protection"
          secondaryValue=""
          load={character.war_gear.armour?.load}
        />
        <ArmourRow
          label="Helm"
          type={character.war_gear.helm ? 'Helm' : ''}
          load={character.war_gear.helm?.load}
        />
        <ArmourRow
          label="Shield"
          type={character.war_gear.shield?.type ?? ''}
          secondaryLabel="Parry"
          secondaryValue={
            character.war_gear.shield ? `+${character.war_gear.shield.parry_bonus}` : ''
          }
          load={character.war_gear.shield?.load}
        />
      </div>
    </div>
  );
}

// --- Right sidebar -------------------------------------------------------

function RightSidebar({
  character,
  fellowshipScore,
  totalLoad,
  update,
}: {
  character: Character;
  fellowshipScore: number;
  totalLoad: number;
  update: (patch: Partial<Character>) => void;
}) {
  return (
    <aside className="flex flex-col gap-5 min-w-0">
      <PortraitFrame />
      <ExperienceTriplet
        character={character}
        fellowshipScore={fellowshipScore}
        update={update}
      />
      <EnduranceLoadCluster
        character={character}
        totalLoad={totalLoad}
        update={update}
      />
      <HopeShadowCluster character={character} update={update} />
      <ConditionsBlock character={character} update={update} />
      <TravellingGearBlock character={character} update={update} />
    </aside>
  );
}

function PortraitFrame() {
  return (
    <div className="aspect-square w-full bg-parchment-deep border-2 border-ink-red flex items-center justify-center">
      <span className="font-label text-[10px] tracking-[0.22em] uppercase text-ink-red/40">
        Portrait
      </span>
    </div>
  );
}

function ExperienceTriplet({
  character,
  fellowshipScore,
  update,
}: {
  character: Character;
  fellowshipScore: number;
  update: (patch: Partial<Character>) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <SidebarStat
        label={
          <>
            Adventure
            <br />
            Points
          </>
        }
      >
        <input
          type="number"
          value={character.experience.adventure_points}
          onChange={(event) =>
            update({
              experience: {
                ...character.experience,
                adventure_points: Number(event.target.value) || 0,
              },
            })
          }
          aria-label="Adventure points"
          className="w-9 bg-transparent border-0 outline-none text-center font-hand text-xl text-ink-navy"
        />
      </SidebarStat>
      <SidebarStat
        label={
          <>
            Skill
            <br />
            Points
          </>
        }
      >
        <input
          type="number"
          value={character.experience.skill_points}
          onChange={(event) =>
            update({
              experience: {
                ...character.experience,
                skill_points: Number(event.target.value) || 0,
              },
            })
          }
          aria-label="Skill points"
          className="w-9 bg-transparent border-0 outline-none text-center font-hand text-xl text-ink-navy"
        />
      </SidebarStat>
      <SidebarStat
        label={
          <>
            Fellowship
            <br />
            Score
          </>
        }
      >
        {fellowshipScore}
      </SidebarStat>
    </div>
  );
}

function SidebarStat({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-label text-[8.5px] leading-3 tracking-[0.18em] uppercase text-ink-red text-center">
        {label}
      </span>
      <Diamond size="md">{children}</Diamond>
    </div>
  );
}

function EnduranceLoadCluster({
  character,
  totalLoad,
  update,
}: {
  character: Character;
  totalLoad: number;
  update: (patch: Partial<Character>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <DiamondLabel className="text-center leading-3">
            Current
            <br />
            Endurance
          </DiamondLabel>
          <Diamond size="md">
            <input
              type="number"
              value={character.current_endurance}
              onChange={(event) =>
                update({ current_endurance: Number(event.target.value) || 0 })
              }
              aria-label="Current endurance"
              className="w-10 bg-transparent border-0 outline-none text-center font-hand text-xl text-ink-navy"
            />
          </Diamond>
        </div>
        <div className="flex flex-col items-center gap-2 mb-1">
          <DiamondLabel>Load</DiamondLabel>
          <Diamond size="sm">{totalLoad}</Diamond>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-1 justify-center">
        <DiamondLabel>Fatigue</DiamondLabel>
        <input
          type="number"
          value={character.fatigue}
          onChange={(event) => update({ fatigue: Number(event.target.value) || 0 })}
          aria-label="Fatigue"
          className="w-12 bg-transparent border-0 border-b border-ink-red/40 outline-none font-hand text-base text-center text-ink-navy"
        />
      </div>
    </div>
  );
}

function HopeShadowCluster({
  character,
  update,
}: {
  character: Character;
  update: (patch: Partial<Character>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <DiamondLabel className="text-center leading-3">
            Current
            <br />
            Hope
          </DiamondLabel>
          <Diamond size="md">
            <input
              type="number"
              value={character.current_hope}
              onChange={(event) =>
                update({ current_hope: Number(event.target.value) || 0 })
              }
              aria-label="Current hope"
              className="w-10 bg-transparent border-0 outline-none text-center font-hand text-xl text-ink-navy"
            />
          </Diamond>
        </div>
        <div className="flex flex-col items-center gap-2 mb-1">
          <DiamondLabel>Shadow</DiamondLabel>
          <Diamond size="sm">
            <input
              type="number"
              value={character.shadow}
              onChange={(event) => update({ shadow: Number(event.target.value) || 0 })}
              aria-label="Shadow"
              className="w-7 bg-transparent border-0 outline-none text-center font-hand text-sm text-ink-navy"
            />
          </Diamond>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-1 justify-center">
        <DiamondLabel>Shadow Scars</DiamondLabel>
        <input
          type="number"
          value={character.shadow_scars}
          onChange={(event) =>
            update({ shadow_scars: Number(event.target.value) || 0 })
          }
          aria-label="Shadow scars"
          className="w-12 bg-transparent border-0 border-b border-ink-red/40 outline-none font-hand text-base text-center text-ink-navy"
        />
      </div>
    </div>
  );
}

function ConditionsBlock({
  character,
  update,
}: {
  character: Character;
  update: (patch: Partial<Character>) => void;
}) {
  return (
    <div>
      <SectionHeader>Conditions</SectionHeader>
      <div className="pt-4 flex flex-col gap-2">
        <ConditionCheck checked={character.conditions.weary} label="Weary" readOnly />
        <ConditionCheck
          checked={character.conditions.miserable}
          label="Miserable"
          readOnly
        />
        <ConditionCheck
          checked={character.conditions.wounded}
          label="Wounded"
          onChange={() =>
            update({
              conditions: {
                ...character.conditions,
                wounded: !character.conditions.wounded,
              },
            })
          }
        />
      </div>
    </div>
  );
}

function TravellingGearBlock({
  character,
  update,
}: {
  character: Character;
  update: (patch: Partial<Character>) => void;
}) {
  return (
    <div>
      <SectionHeader>Travelling Gear</SectionHeader>
      <textarea
        value={character.travelling_gear.join('\n')}
        onChange={(event) =>
          update({
            travelling_gear: event.target.value
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean),
          })
        }
        rows={4}
        placeholder="One item per line"
        aria-label="Travelling gear"
        className="w-full mt-2 bg-transparent border-0 outline-none font-hand text-base text-ink-navy resize-none placeholder:text-ink-navy/30"
      />
    </div>
  );
}

// --- Shared bits ---------------------------------------------------------

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <header className="relative border-t border-ink-red flex items-center justify-center -mt-2">
      <h3 className="bg-parchment px-3 font-display text-sm sm:text-base tracking-[0.25em] uppercase text-ink-red">
        {children}
      </h3>
    </header>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="font-label text-[9.5px] tracking-[0.18em] uppercase text-ink-red">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-hand text-lg text-ink-navy pb-0.5 placeholder:text-ink-navy/30 focus:border-ink-red transition-colors"
      />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="font-label text-[9.5px] tracking-[0.18em] uppercase text-ink-red">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-hand text-lg text-ink-navy pb-0.5 focus:border-ink-red transition-colors"
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  displayFallback?: string;
};

function SelectField({ label, value, options, onChange, displayFallback }: SelectFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value);
  const matched = options.some((option) => option.value === value);
  const effectiveValue = matched ? value : '';
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="font-label text-[9.5px] tracking-[0.18em] uppercase text-ink-red">
        {label}
      </span>
      <div className="relative">
        <select
          value={effectiveValue}
          onChange={handleChange}
          className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-hand text-lg text-ink-navy pb-0.5 appearance-none cursor-pointer pr-6 focus:border-ink-red transition-colors"
        >
          {!matched && <option value="">{displayFallback || '—'}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink-red/70 text-xs"
        >
          ▾
        </span>
      </div>
    </label>
  );
}

type ArmourRowProps = {
  label: string;
  type: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  load?: number;
};

function ArmourRow({ label, type, secondaryLabel, secondaryValue, load }: ArmourRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-3 border-b border-ink-red/30 pb-0.5">
      <div className="flex flex-col min-w-0">
        <span className="font-label text-[9.5px] tracking-[0.18em] uppercase text-ink-red">
          {label}
        </span>
        <span className="font-hand text-lg text-ink-navy truncate min-h-[1.5rem]">
          {type || ''}
        </span>
      </div>
      <div className="flex flex-col items-center min-w-[64px]">
        <span className="font-label text-[9.5px] tracking-[0.18em] uppercase text-ink-red">
          {secondaryLabel ?? ''}
        </span>
        <span className="font-hand text-lg text-ink-navy min-h-[1.5rem]">
          {secondaryValue ?? ''}
        </span>
      </div>
      <div className="flex flex-col items-center min-w-[44px]">
        <span className="font-label text-[9.5px] tracking-[0.18em] uppercase text-ink-red">
          Load
        </span>
        <span className="font-hand text-lg text-ink-navy min-h-[1.5rem]">
          {load !== undefined ? load : ''}
        </span>
      </div>
    </div>
  );
}
