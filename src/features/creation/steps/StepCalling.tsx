import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectionCard } from '../../../app/ui/SelectionCard';
import { CALLINGS, STANDARD_OF_LIVING, type Calling, type StandardOfLiving } from '../../../domain/types';
import { CALLINGS_DATA } from '../../../ref-data/callings';
import { ARMOUR, SHIELDS, WEAPONS } from '../../../ref-data/equipment';
import { STARTING_EQUIPMENT_BY_SOL } from '../../../ref-data/equipment-by-sol';
import { callingKey, standardOfLivingKey } from '../../../ref-data/labels';
import { REWARDS } from '../../../ref-data/rewards';
import { SKILLS, type SkillId } from '../../../ref-data/skills';
import { VIRTUES } from '../../../ref-data/virtues';
import type { CreationDraft } from '../creationSchema';

const STANDARD_REWARD_IDS = REWARDS.filter((r) => r.kind === 'standard').map((r) => r.id);
const STANDARD_VIRTUE_IDS = VIRTUES.filter((v) => v.kind === 'standard').map((v) => v.id);

const ARMOUR_BY_ID = new Map<string, (typeof ARMOUR)[number]>(
  ARMOUR.map((entry) => [entry.id, entry]),
);
const SHIELD_BY_ID = new Map<string, (typeof SHIELDS)[number]>(
  SHIELDS.map((entry) => [entry.id, entry]),
);
const WEAPON_BY_ID = new Map<string, (typeof WEAPONS)[number]>(
  WEAPONS.map((entry) => [entry.id, entry]),
);

export function StepCalling() {
  const { t } = useTranslation();
  const { control, setValue, register } = useFormContext<CreationDraft>();
  const calling = useWatch({ control, name: 'calling' });
  const callingFeature = useWatch({ control, name: 'calling_feature' });
  const sol = useWatch({ control, name: 'standard_of_living' });
  const startingReward = useWatch({ control, name: 'starting_reward' });
  const startingVirtue = useWatch({ control, name: 'starting_virtue' });
  const startingVirtueSelection = useWatch({ control, name: 'starting_virtue_selection' });
  const weapons = useWatch({ control, name: 'weapons' });
  const armour = useWatch({ control, name: 'armour' });
  const shield = useWatch({ control, name: 'shield' });

  const callingData = calling ? CALLINGS_DATA[calling] : null;
  const equipmentSlice = sol ? STARTING_EQUIPMENT_BY_SOL[sol] : null;
  const callingFeatureOptions = !callingData
    ? []
    : callingData.enemyLoreOptions
      ? callingData.enemyLoreOptions.map((option) => ({
          value: option,
          label: t(`ref.enemyLore.${option}`),
        }))
      : [
          {
            value: callingData.distinctiveFeatureId,
            label: t(`ref.distinctiveFeatures.callings.${callingData.distinctiveFeatureId}`),
          },
        ];

  function toggleWeapon(weaponId: string) {
    const entry = WEAPON_BY_ID.get(weaponId);
    if (!entry) return;
    const exists = weapons.find((w) => w.id === weaponId);
    const next = exists
      ? weapons.filter((w) => w.id !== weaponId)
      : weapons.length < 4
        ? [...weapons, { id: weaponId, load: entry.load }]
        : weapons;
    setValue('weapons', next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
        {t('creation.step.calling.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.calling.body')}
      </p>

      <Block title={t('creation.step.calling.choose-calling')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CALLINGS.map((c: Calling) => (
            <SelectionCard
              key={c}
              active={calling === c}
              padding="sm"
              onClick={() => {
                setValue('calling', c, { shouldDirty: true, shouldValidate: true });
                setValue('calling_feature', '', { shouldValidate: true });
              }}
            >
              <p className="font-display text-sm tracking-section uppercase text-ink-navy">
                {t(callingKey(c))}
              </p>
              <p className="font-body text-xs text-ink-navy/60 mt-1">
                {t(`ref.shadowPaths.${CALLINGS_DATA[c].shadowPath}`)}
              </p>
            </SelectionCard>
          ))}
        </div>
      </Block>

      <Block title={t('creation.step.calling.calling-feature')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {callingFeatureOptions.map((option) => (
            <SelectionCard
              key={option.value}
              active={callingFeature === option.value}
              padding="sm"
              onClick={() =>
                setValue('calling_feature', option.value, { shouldDirty: true, shouldValidate: true })
              }
            >
              <span className="font-display text-sm tracking-section uppercase text-ink-navy">
                {option.label}
              </span>
            </SelectionCard>
          ))}
        </div>
      </Block>

      <Block title={t('creation.step.calling.starting-reward')}>
        <SelectRow
          value={startingReward}
          placeholder={t('common.choose')}
          options={STANDARD_REWARD_IDS.map((id) => ({ value: id, label: t(`ref.rewards.standard.${id}`) }))}
          onChange={(value) =>
            setValue('starting_reward', value, { shouldDirty: true, shouldValidate: true })
          }
        />
      </Block>

      <Block title={t('creation.step.calling.starting-virtue')}>
        <SelectRow
          value={startingVirtue}
          placeholder={t('common.choose')}
          options={STANDARD_VIRTUE_IDS.map((id) => ({ value: id, label: t(`ref.virtues.standard.${id}`) }))}
          onChange={(value) => {
            setValue('starting_virtue', value, { shouldDirty: true, shouldValidate: true });
            setValue('starting_virtue_selection', null, { shouldValidate: true });
          }}
        />
      </Block>

      {startingVirtue === 'mastery' && (
        <Block title={t('creation.step.calling.mastery-skills')}>
          <p className="font-body text-sm text-ink-navy/70 mb-2">
            {t('creation.step.calling.mastery-skills-body')}
          </p>
          <MasteryPicker />
        </Block>
      )}

      {startingVirtue === 'prowess' && (
        <Block title={t('creation.step.calling.prowess-attribute')}>
          <p className="font-body text-sm text-ink-navy/70 mb-2">
            {t('creation.step.calling.prowess-attribute-body')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['strength', 'heart', 'wits'] as const).map((attribute) => {
              const active =
                startingVirtueSelection?.kind === 'prowess' &&
                startingVirtueSelection.attribute === attribute;
              return (
                <SelectionCard
                  key={attribute}
                  active={active}
                  padding="sm"
                  onClick={() =>
                    setValue(
                      'starting_virtue_selection',
                      { kind: 'prowess', attribute },
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                >
                  <span className="font-display text-sm tracking-section uppercase text-ink-navy">
                    {t(`sheet.attribute.${attribute}`)}
                  </span>
                </SelectionCard>
              );
            })}
          </div>
        </Block>
      )}

      <Block title={t('creation.step.calling.standard-of-living')}>
        <select
          {...register('standard_of_living')}
          defaultValue=""
          className="bg-parchment-soft border border-ink-red/40 px-3 py-2 font-body text-base text-ink-navy"
        >
          <option value="">{t('common.choose')}</option>
          {STANDARD_OF_LIVING.map((s: StandardOfLiving) => (
            <option key={s} value={s}>{t(standardOfLivingKey(s))}</option>
          ))}
        </select>
      </Block>

      <Block title={t('creation.step.calling.weapons', { count: weapons.length, max: 4 })}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(equipmentSlice?.weaponIds ?? []).map((weaponId) => {
            const entry = WEAPON_BY_ID.get(weaponId);
            if (!entry) return null;
            const active = weapons.some((w) => w.id === weaponId);
            return (
              <SelectionCard
                key={weaponId}
                active={active}
                padding="sm"
                onClick={() => toggleWeapon(weaponId)}
              >
                <p className="font-display text-sm tracking-section uppercase text-ink-navy">
                  {t(`ref.equipment.weapons.${weaponId}`)}
                </p>
                <p className="font-body text-xs text-ink-navy/60">
                  {t('sheet.label.load')} {entry.load}
                </p>
              </SelectionCard>
            );
          })}
        </div>
      </Block>

      <Block title={t('creation.step.calling.armour')}>
        <SelectRow
          value={armour?.id ?? ''}
          placeholder={t('common.dash')}
          options={(equipmentSlice?.armourIds ?? []).map((id) => ({
            value: id,
            label: t(`ref.equipment.armour.${id}`),
          }))}
          onChange={(value) => {
            const entry = ARMOUR_BY_ID.get(value);
            setValue('armour', entry ? { id: entry.id, load: entry.load } : null, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        />
      </Block>

      <Block title={t('creation.step.calling.shield')}>
        <SelectRow
          value={shield?.id ?? ''}
          placeholder={t('common.dash')}
          options={(equipmentSlice?.shieldIds ?? []).map((id) => ({
            value: id,
            label: t(`ref.equipment.shields.${id}`),
          }))}
          onChange={(value) => {
            const entry = SHIELD_BY_ID.get(value);
            setValue(
              'shield',
              entry ? { id: entry.id, load: entry.load, parry_bonus: entry.parryBonus } : null,
              { shouldDirty: true, shouldValidate: true },
            );
          }}
        />
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-display text-base tracking-label uppercase text-ink-red border-b border-ink-red/30 pb-1">
        {title}
      </h3>
      {children}
    </section>
  );
}

// In-progress mastery state lives locally because the form schema only
// accepts a complete pair (skill_ids of length 2). Without this lift the
// picker could not show a single-skill intermediate selection — every
// click would round-trip to null in the form and the chips would never
// appear pressed before the second pick.
function MasteryPicker() {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<CreationDraft>();
  const persisted = useWatch({ control, name: 'starting_virtue_selection' });
  const startingVirtue = useWatch({ control, name: 'starting_virtue' });

  const [draft, setDraft] = useState<readonly SkillId[]>(() =>
    persisted?.kind === 'mastery' ? [...persisted.skill_ids] : [],
  );

  // Re-sync from the form when the persisted value changes from outside
  // (e.g. starting_virtue toggled away from mastery and back, or the
  // user navigated back into this step with a previous pair stored).
  useEffect(() => {
    if (startingVirtue !== 'mastery') {
      setDraft([]);
      return;
    }
    if (persisted?.kind === 'mastery') {
      const [a, b] = persisted.skill_ids;
      if (draft[0] !== a || draft[1] !== b) {
        setDraft([a, b]);
      }
    } else if (draft.length === 2) {
      // Persisted was cleared elsewhere — drop the local pair too.
      setDraft([]);
    }
  }, [persisted, startingVirtue, draft]);

  function toggle(skillId: SkillId) {
    const exists = draft.includes(skillId);
    const next: readonly SkillId[] = exists
      ? draft.filter((id) => id !== skillId)
      : draft.length < 2
        ? [...draft, skillId]
        : draft;
    if (next === draft) return;
    // setValue must not run inside the setDraft updater: react-hook-form
    // schedules a parent state update synchronously, which React then
    // flags as "setState in another component while rendering this one".
    if (next.length === 2) {
      setValue(
        'starting_virtue_selection',
        { kind: 'mastery', skill_ids: [next[0]!, next[1]!] },
        { shouldDirty: true, shouldValidate: true },
      );
    } else if (persisted?.kind === 'mastery') {
      // Drop a previously complete pair only when leaving the 2-state.
      setValue('starting_virtue_selection', null, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    setDraft(next);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {SKILLS.map((skill) => {
        const active = draft.includes(skill.id);
        const disabled = !active && draft.length >= 2;
        return (
          <SelectionCard
            key={skill.id}
            active={active}
            disabled={disabled}
            padding="sm"
            onClick={() => toggle(skill.id)}
          >
            <span className="font-display text-sm tracking-section uppercase text-ink-navy">
              {t(`ref.skills.${skill.id}`)}
            </span>
          </SelectionCard>
        );
      })}
    </div>
  );
}

function SelectRow({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="bg-parchment-soft border border-ink-red/40 px-3 py-2 font-body text-base text-ink-navy"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
