import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { normaliseCharacter } from '../../domain/normalise';
import {
  CALLINGS,
  HEROIC_CULTURES,
  STANDARD_OF_LIVING,
} from '../../domain/types';
import type { Character, Skill } from '../../domain/types';
import { BLESSING_BY_CULTURE, legacyNameToBlessingId } from '../../ref-data/blessings';
import { SHADOW_PATHS, legacyNameToShadowPath } from '../../ref-data/callings';
import {
  findCultureForFeature,
  isCallingDistinctiveFeatureId,
  isKnownDistinctiveFeatureId,
  legacyNameToDistinctiveFeatureId,
} from '../../ref-data/distinctive-features';
import { callingKey, heroicCultureKey, standardOfLivingKey } from '../../ref-data/labels';
import { PATRONS, patronFallbackName } from '../../ref-data/patrons';
import { ConditionCheck } from './ui/ConditionCheck';
import { Diamond, DiamondLabel } from './ui/Diamond';
import { FavouredCheck } from './ui/FavouredCheck';
import { PipRow } from './ui/Pip';

type Props = {
  character: Character;
  onChange: (character: Character) => void;
};

const ATTRIBUTE_KEY: Record<Skill['category'], 'strength' | 'heart' | 'wits'> = {
  STRENGTH: 'strength',
  HEART: 'heart',
  WITS: 'wits',
};

const COMBAT_PROFICIENCY_KEY: Record<'AXES' | 'BOWS' | 'SPEARS' | 'SWORDS', string> = {
  AXES: 'axes',
  BOWS: 'bows',
  SPEARS: 'spears',
  SWORDS: 'swords',
};

const CATEGORY_DERIVED: Record<
  Skill['category'],
  {
    ratingField: 'strength' | 'heart' | 'wits';
    tnField: 'tn_strength' | 'tn_heart' | 'tn_wits';
    derivedKey: 'endurance' | 'hope' | 'parry';
  }
> = {
  STRENGTH: { ratingField: 'strength', tnField: 'tn_strength', derivedKey: 'endurance' },
  HEART: { ratingField: 'heart', tnField: 'tn_heart', derivedKey: 'hope' },
  WITS: { ratingField: 'wits', tnField: 'tn_wits', derivedKey: 'parry' },
};

function joinList(values: readonly string[]): string {
  return values.join(', ');
}

function renderDistinctiveFeatureLabel(
  t: TFunction,
  raw: string,
  characterCulture: Character['heroic_culture'],
): string {
  if (isCallingDistinctiveFeatureId(raw)) {
    return t(`ref.distinctiveFeatures.callings.${raw}`);
  }
  if (isKnownDistinctiveFeatureId(raw)) {
    const culture = findCultureForFeature(raw) ?? characterCulture;
    const cultureKey = culture.toLowerCase().replace(/_/g, '-');
    return t(`ref.distinctiveFeatures.cultures.${cultureKey}.${raw}`);
  }
  const legacyId = legacyNameToDistinctiveFeatureId(raw);
  if (legacyId) {
    return renderDistinctiveFeatureLabel(t, legacyId, characterCulture);
  }
  return raw;
}

const SHADOW_PATH_SET = new Set<string>(SHADOW_PATHS);

function renderShadowPathLabel(t: TFunction, raw: string): string {
  if (!raw) return '';
  if (SHADOW_PATH_SET.has(raw)) return t(`ref.shadowPaths.${raw}`);
  const mapped = legacyNameToShadowPath(raw);
  if (mapped) return t(`ref.shadowPaths.${mapped}`);
  return raw;
}

function resolveBlessingId(character: Character): string {
  const stored = character.cultural_blessing;
  if (stored && legacyNameToBlessingId(stored)) {
    return legacyNameToBlessingId(stored) as string;
  }
  if (stored && Object.values(BLESSING_BY_CULTURE).includes(stored as never)) {
    return stored;
  }
  return BLESSING_BY_CULTURE[character.heroic_culture];
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PrintedCharacterSheet({ character, onChange }: Props) {
  const { t } = useTranslation();

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
      className="sheet relative w-full max-w-[1500px] mx-auto bg-parchment border-2 border-ink-red shadow-sheet"
      aria-label={t('sheet.aria.sheet-root')}
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
  const { t } = useTranslation();
  return (
    <header className="border-2 border-ink-red px-4 pt-2 pb-3 text-center">
      <span className="font-label text-microlabel tracking-[0.25em] uppercase text-ink-red">
        {t('sheet.label.name')}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('sheet.placeholder.name')}
        aria-label={t('sheet.aria.character-name')}
        className="block w-full bg-transparent border-0 outline-none focus-visible:bg-ink-red/5 text-center font-hand text-3xl sm:text-4xl text-ink-navy placeholder:text-ink-navy/30"
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
  const { t } = useTranslation();
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
      <div className="flex flex-col gap-3">
        <SelectField
          label={t('sheet.label.heroic-culture')}
          value={character.heroic_culture}
          options={HEROIC_CULTURES.map((culture) => ({
            value: culture,
            label: t(heroicCultureKey(culture)),
          }))}
          onChange={(value) => onChange({ heroic_culture: value as Character['heroic_culture'] })}
        />
        <DerivedField
          label={t('sheet.label.cultural-blessing')}
          value={t(`ref.blessings.${resolveBlessingId(character)}`)}
        />
        <SelectField
          label={t('sheet.label.calling')}
          value={character.calling}
          options={CALLINGS.map((calling) => ({
            value: calling,
            label: t(callingKey(calling)),
          }))}
          onChange={(value) => onChange({ calling: value as Character['calling'] })}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[60px_minmax(0,1fr)_72px] gap-3 items-end">
          <NumberField
            label={t('sheet.label.age')}
            value={character.age}
            onChange={(value) => onChange({ age: value })}
          />
          <SelectField
            label={t('sheet.label.standard-of-living')}
            value={character.standard_of_living}
            options={STANDARD_OF_LIVING.map((value) => ({
              value,
              label: t(standardOfLivingKey(value)),
            }))}
            onChange={(value) =>
              onChange({ standard_of_living: value as Character['standard_of_living'] })
            }
          />
          <div className="flex flex-col items-center gap-1">
            <DiamondLabel>{t('sheet.label.treasure')}</DiamondLabel>
            <Diamond size="md">
              <input
                type="number"
                value={character.treasure}
                onChange={(event) =>
                  onChange({ treasure: Number(event.target.value) || 0 })
                }
                aria-label={t('sheet.aria.treasure')}
                className="w-10 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-xl text-ink-navy"
              />
            </Diamond>
          </div>
        </div>
        <SelectField
          label={t('sheet.label.patron')}
          value={patronValue}
          options={[
            { value: '', label: t('common.dash') },
            ...PATRONS.map((p) => ({ value: p.id, label: t(`ref.patrons.${p.id}`) })),
          ]}
          onChange={(value) => onChange({ company_id: value })}
          displayFallback={patronFallbackName(character.company_id)}
        />
        <DerivedField
          label={t('sheet.label.shadow-path')}
          value={renderShadowPathLabel(t, character.shadow_path)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <TextField
          label={t('sheet.label.distinctive-features')}
          value={joinList(
            character.distinctive_features.map((raw) =>
              renderDistinctiveFeatureLabel(t, raw, character.heroic_culture),
            ),
          )}
          onChange={(value) => onChange({ distinctive_features: splitList(value) })}
          placeholder={t('sheet.placeholder.distinctive-features')}
        />
        <TextField
          label={t('sheet.label.flaws')}
          value={joinList(character.flaws)}
          onChange={(value) => onChange({ flaws: splitList(value) })}
          placeholder={t('sheet.placeholder.flaws')}
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
  const { t } = useTranslation();
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
        const attributeKey = ATTRIBUTE_KEY[category];
        return (
          <div key={category} className="flex flex-col items-center gap-3">
            <h3 className="font-display text-xl tracking-[0.22em] uppercase text-ink-red">
              {t(`sheet.attribute.${attributeKey}`)}
            </h3>
            <AttributeCluster
              tn={tn}
              rating={rating}
              derived={derived}
              derivedLabel={t(`sheet.label.derived.${meta.derivedKey}`)}
              ratingAriaLabel={t(`sheet.aria.${attributeKey}-rating`)}
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
  ratingAriaLabel,
  onChangeRating,
}: {
  tn: number;
  rating: number;
  derived: number;
  derivedLabel: string;
  ratingAriaLabel: string;
  onChangeRating: (value: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-[auto_auto] gap-x-3 items-center">
      <div className="flex flex-col items-center gap-1.5">
        <Diamond size="lg">{tn}</Diamond>
        <DiamondLabel>{t('sheet.label.tn')}</DiamondLabel>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Diamond size="md">
            <input
              type="number"
              value={rating}
              onChange={(event) => onChangeRating(Number(event.target.value) || 0)}
              aria-label={ratingAriaLabel}
              className="w-10 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-2xl text-ink-navy"
            />
          </Diamond>
          <DiamondLabel>{t('sheet.label.rating')}</DiamondLabel>
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
  const { t } = useTranslation();
  return (
    <section>
      <SectionHeader>{t('sheet.section.skills')}</SectionHeader>
      <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-4">
        {(['STRENGTH', 'HEART', 'WITS'] as const).map((category) => (
          <ul key={category} className="flex flex-col gap-1.5">
            {character.skills
              .filter((skill) => skill.category === category)
              .map((skill) => {
                const label = skill.id ? t(`ref.skills.${skill.id}`) : skill.name;
                return (
                  <li
                    key={skill.id ?? skill.name}
                    className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-3 border-b border-ink-red/30 py-1"
                  >
                    <FavouredCheck
                      checked={skill.favoured}
                      onChange={() => updateSkill(skill.name, { favoured: !skill.favoured })}
                      label={label}
                    />
                    <span className="font-body text-base text-ink-navy truncate">{label}</span>
                    <PipRow
                      rating={skill.rating}
                      onChange={(rating) => updateSkill(skill.name, { rating })}
                      label={label}
                    />
                  </li>
                );
              })}
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
  const { t } = useTranslation();
  return (
    <section className="grid grid-cols-3 gap-6 sm:gap-8">
      <div>
        <SectionHeader>{t('sheet.section.combat-proficiencies')}</SectionHeader>
        <ul className="flex flex-col gap-1.5 pt-4">
          {character.combat_proficiencies.map((proficiency) => (
            <li
              key={proficiency.name}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-ink-red/30 py-1"
            >
              <span className="font-body text-base text-ink-navy">
                {t(`sheet.combat-proficiency.${COMBAT_PROFICIENCY_KEY[proficiency.name]}`)}
              </span>
              <PipRow
                rating={proficiency.rating}
                onChange={(rating) => updateProficiency(proficiency.name, rating)}
                label={t(`sheet.combat-proficiency.${COMBAT_PROFICIENCY_KEY[proficiency.name]}`)}
              />
            </li>
          ))}
        </ul>
      </div>

      <RewardLikeColumn
        title={t('sheet.section.rewards')}
        statLabel={t('sheet.label.valour')}
        statValue={character.valour}
        onStatChange={(value) => update({ valour: value })}
        items={character.rewards.map((r) => r.name)}
        emptyMessage={t('sheet.empty.no-rewards')}
      />
      <RewardLikeColumn
        title={t('sheet.section.virtues')}
        statLabel={t('sheet.label.wisdom')}
        statValue={character.wisdom}
        onStatChange={(value) => update({ wisdom: value })}
        items={character.virtues.map((v) => v.name)}
        emptyMessage={t('sheet.empty.no-virtues')}
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
  emptyMessage,
}: {
  title: string;
  statLabel: string;
  statValue: number;
  onStatChange: (value: number) => void;
  items: string[];
  emptyMessage: string;
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
              className="w-10 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-xl text-ink-navy"
            />
          </Diamond>
        </div>
      </header>
      <ul className="pt-4 flex flex-col gap-1 min-h-[96px]">
        {items.length === 0 && (
          <li className="font-body text-sm text-ink-navy/40 italic">
            {emptyMessage}
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
  const { t } = useTranslation();
  return (
    <div>
      <SectionHeader>{t('sheet.section.war-gear')}</SectionHeader>
      <table className="w-full mt-3 text-left">
        <thead>
          <tr className="font-label text-microcaption tracking-wider uppercase text-ink-red/85">
            <th className="font-normal pb-1">{t('sheet.weapon.column.weapon')}</th>
            <th className="font-normal pb-1 text-center">{t('sheet.weapon.column.damage')}</th>
            <th className="font-normal pb-1 text-center">{t('sheet.weapon.column.injury')}</th>
            <th className="font-normal pb-1 text-center">{t('sheet.weapon.column.load')}</th>
            <th className="font-normal pb-1">{t('sheet.weapon.column.notes')}</th>
          </tr>
        </thead>
        <tbody>
          {character.war_gear.weapons.length === 0 && (
            <tr>
              <td colSpan={5} className="font-body text-sm text-ink-navy/40 italic py-2">
                {t('sheet.empty.no-weapons')}
              </td>
            </tr>
          )}
          {character.war_gear.weapons.map((weapon, index) => {
            const label = weapon.id ? t(`ref.equipment.weapons.${weapon.id}`) : weapon.type;
            return (
              <tr key={`${weapon.id ?? weapon.type}-${index}`} className="border-b border-ink-red/30">
                <td className="font-hand text-lg text-ink-navy py-0.5">{label}</td>
                <td className="font-hand text-lg text-ink-navy text-center">{t('common.dash')}</td>
                <td className="font-hand text-lg text-ink-navy text-center">{t('common.dash')}</td>
                <td className="font-hand text-lg text-ink-navy text-center">{weapon.load}</td>
                <td className="font-hand text-lg text-ink-navy" />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ArmourPanel({ character }: { character: Character }) {
  const { t } = useTranslation();
  return (
    <div>
      <SectionHeader>{t('sheet.section.armour')}</SectionHeader>
      <div className="mt-3 flex flex-col gap-2">
        <ArmourRow
          label={t('sheet.armour.label.armour')}
          type={
            character.war_gear.armour?.id
              ? t(`ref.equipment.armour.${character.war_gear.armour.id}`)
              : (character.war_gear.armour?.type ?? '')
          }
          secondaryLabel={t('sheet.armour.label.protection')}
          secondaryValue=""
          load={character.war_gear.armour?.load}
        />
        <ArmourRow
          label={t('sheet.armour.label.helm')}
          type={character.war_gear.helm ? t('sheet.armour.helm-name') : ''}
          load={character.war_gear.helm?.load}
        />
        <ArmourRow
          label={t('sheet.armour.label.shield')}
          type={
            character.war_gear.shield?.id
              ? t(`ref.equipment.shields.${character.war_gear.shield.id}`)
              : (character.war_gear.shield?.type ?? '')
          }
          secondaryLabel={t('sheet.armour.label.parry')}
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
  const { t } = useTranslation();
  return (
    <div className="aspect-square w-full bg-parchment-deep border-2 border-ink-red flex items-center justify-center">
      <span className="font-label text-microlabel tracking-[0.22em] uppercase text-ink-red/40">
        {t('sheet.label.portrait')}
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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-3 gap-2">
      <SidebarStat label={twoLine(t, 'sheet.label.adventure-points')}>
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
          aria-label={t('sheet.aria.adventure-points')}
          className="w-9 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-xl text-ink-navy"
        />
      </SidebarStat>
      <SidebarStat label={twoLine(t, 'sheet.label.skill-points')}>
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
          aria-label={t('sheet.aria.skill-points')}
          className="w-9 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-xl text-ink-navy"
        />
      </SidebarStat>
      <SidebarStat label={twoLine(t, 'sheet.label.fellowship-score')}>
        {fellowshipScore}
      </SidebarStat>
    </div>
  );
}

/**
 * Render a label that the original English version split across two lines.
 * In pt-BR we keep the natural phrase and let CSS wrap when needed.
 */
function twoLine(t: TFunction, key: string): ReactNode {
  return t(key);
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
      <span className="font-label text-microline leading-3 tracking-[0.18em] uppercase text-ink-red text-center">
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <DiamondLabel className="text-center leading-3">
            {t('sheet.label.current-endurance')}
          </DiamondLabel>
          <Diamond size="md">
            <input
              type="number"
              value={character.current_endurance}
              onChange={(event) =>
                update({ current_endurance: Number(event.target.value) || 0 })
              }
              aria-label={t('sheet.aria.current-endurance')}
              className="w-10 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-xl text-ink-navy"
            />
          </Diamond>
        </div>
        <div className="flex flex-col items-center gap-2 mb-1">
          <DiamondLabel>{t('sheet.label.load')}</DiamondLabel>
          <Diamond size="sm">{totalLoad}</Diamond>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-1 justify-center">
        <DiamondLabel>{t('sheet.label.fatigue')}</DiamondLabel>
        <input
          type="number"
          value={character.fatigue}
          onChange={(event) => update({ fatigue: Number(event.target.value) || 0 })}
          aria-label={t('sheet.aria.fatigue')}
          className="w-12 bg-transparent border-0 border-b border-ink-red/40 outline-none focus:border-ink-red focus-visible:bg-ink-red/5 font-hand text-base text-center text-ink-navy transition-colors"
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <DiamondLabel className="text-center leading-3">
            {t('sheet.label.current-hope')}
          </DiamondLabel>
          <Diamond size="md">
            <input
              type="number"
              value={character.current_hope}
              onChange={(event) =>
                update({ current_hope: Number(event.target.value) || 0 })
              }
              aria-label={t('sheet.aria.current-hope')}
              className="w-10 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-xl text-ink-navy"
            />
          </Diamond>
        </div>
        <div className="flex flex-col items-center gap-2 mb-1">
          <DiamondLabel>{t('sheet.label.shadow')}</DiamondLabel>
          <Diamond size="sm">
            <input
              type="number"
              value={character.shadow}
              onChange={(event) => update({ shadow: Number(event.target.value) || 0 })}
              aria-label={t('sheet.aria.shadow')}
              className="w-7 bg-transparent border-0 outline-none focus-visible:bg-ink-red/10 text-center font-hand text-sm text-ink-navy"
            />
          </Diamond>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mt-1 justify-center">
        <DiamondLabel>{t('sheet.label.shadow-scars')}</DiamondLabel>
        <input
          type="number"
          value={character.shadow_scars}
          onChange={(event) =>
            update({ shadow_scars: Number(event.target.value) || 0 })
          }
          aria-label={t('sheet.aria.shadow-scars')}
          className="w-12 bg-transparent border-0 border-b border-ink-red/40 outline-none focus:border-ink-red focus-visible:bg-ink-red/5 font-hand text-base text-center text-ink-navy transition-colors"
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
  const { t } = useTranslation();
  return (
    <div>
      <SectionHeader>{t('sheet.section.conditions')}</SectionHeader>
      <div className="pt-4 flex flex-col gap-2">
        <ConditionCheck checked={character.conditions.weary} label={t('sheet.condition.weary')} readOnly />
        <ConditionCheck
          checked={character.conditions.miserable}
          label={t('sheet.condition.miserable')}
          readOnly
        />
        <ConditionCheck
          checked={character.conditions.wounded}
          label={t('sheet.condition.wounded')}
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
  const { t } = useTranslation();
  return (
    <div>
      <SectionHeader>{t('sheet.section.travelling-gear')}</SectionHeader>
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
        placeholder={t('sheet.placeholder.travelling-gear')}
        aria-label={t('sheet.aria.travelling-gear')}
        className="w-full mt-2 bg-transparent border-0 outline-none focus-visible:bg-ink-red/5 font-hand text-base text-ink-navy resize-none placeholder:text-ink-navy/30"
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
      <span className="font-label text-microcaption tracking-[0.18em] uppercase text-ink-red">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-hand text-lg text-ink-navy pb-0.5 placeholder:text-ink-navy/30 focus:border-ink-red focus-visible:bg-ink-red/5 transition-colors"
      />
    </label>
  );
}

function DerivedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="font-label text-microcaption tracking-[0.18em] uppercase text-ink-red">
        {label}
      </span>
      <output className="w-full bg-transparent border-0 border-b border-ink-red/30 font-hand text-lg text-ink-navy pb-0.5">
        {value}
      </output>
    </div>
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
      <span className="font-label text-microcaption tracking-[0.18em] uppercase text-ink-red">
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
  const { t } = useTranslation();
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value);
  const matched = options.some((option) => option.value === value);
  const effectiveValue = matched ? value : '';
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="font-label text-microcaption tracking-[0.18em] uppercase text-ink-red">
        {label}
      </span>
      <div className="relative">
        <select
          value={effectiveValue}
          onChange={handleChange}
          className="w-full bg-transparent border-0 border-b border-ink-red/60 outline-none font-hand text-lg text-ink-navy pb-0.5 appearance-none cursor-pointer pr-6 focus:border-ink-red focus-visible:bg-ink-red/5 transition-colors"
        >
          {!matched && <option value="">{displayFallback || t('common.dash')}</option>}
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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-3 border-b border-ink-red/30 pb-0.5">
      <div className="flex flex-col min-w-0">
        <span className="font-label text-microcaption tracking-[0.18em] uppercase text-ink-red">
          {label}
        </span>
        <span className="font-hand text-lg text-ink-navy truncate min-h-[1.5rem]">
          {type || ''}
        </span>
      </div>
      <div className="flex flex-col items-center min-w-[64px]">
        <span className="font-label text-microcaption tracking-[0.18em] uppercase text-ink-red">
          {secondaryLabel ?? ''}
        </span>
        <span className="font-hand text-lg text-ink-navy min-h-[1.5rem]">
          {secondaryValue ?? ''}
        </span>
      </div>
      <div className="flex flex-col items-center min-w-[44px]">
        <span className="font-label text-microcaption tracking-[0.18em] uppercase text-ink-red">
          {t('sheet.label.load')}
        </span>
        <span className="font-hand text-lg text-ink-navy min-h-[1.5rem]">
          {load !== undefined ? load : ''}
        </span>
      </div>
    </div>
  );
}
