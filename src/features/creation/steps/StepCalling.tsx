import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CALLINGS, STANDARD_OF_LIVING, type Calling, type StandardOfLiving } from '../../../domain/types';
import { CALLINGS_DATA } from '../../../ref-data/callings';
import { ARMOUR, SHIELDS, WEAPONS } from '../../../ref-data/equipment';
import { STARTING_EQUIPMENT_BY_SOL } from '../../../ref-data/equipment-by-sol';
import { callingKey, standardOfLivingKey } from '../../../ref-data/labels';
import { REWARDS } from '../../../ref-data/rewards';
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
      <h2 className="font-display text-2xl tracking-[0.06em] text-ink-navy">
        {t('creation.step.calling.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.calling.body')}
      </p>

      <Block title={t('creation.step.calling.choose-calling')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CALLINGS.map((c: Calling) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setValue('calling', c, { shouldDirty: true, shouldValidate: true });
                setValue('calling_feature', '', { shouldValidate: true });
              }}
              aria-pressed={calling === c}
              className={`p-3 border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
                calling === c ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 hover:border-ink-red/70'
              }`}
            >
              <p className="font-display text-sm tracking-[0.12em] uppercase text-ink-navy">
                {t(callingKey(c))}
              </p>
              <p className="font-body text-xs text-ink-navy/60 mt-1">
                {t(`ref.shadowPaths.${CALLINGS_DATA[c].shadowPath}`)}
              </p>
            </button>
          ))}
        </div>
      </Block>

      <Block title={t('creation.step.calling.calling-feature')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {callingFeatureOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setValue('calling_feature', option.value, { shouldDirty: true, shouldValidate: true })
              }
              aria-pressed={callingFeature === option.value}
              className={`p-3 text-left border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
                callingFeature === option.value ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 hover:border-ink-red/70'
              }`}
            >
              <span className="font-display text-sm tracking-[0.1em] uppercase text-ink-navy">
                {option.label}
              </span>
            </button>
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
          onChange={(value) =>
            setValue('starting_virtue', value, { shouldDirty: true, shouldValidate: true })
          }
        />
      </Block>

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
              <button
                key={weaponId}
                type="button"
                onClick={() => toggleWeapon(weaponId)}
                aria-pressed={active}
                className={`p-3 text-left border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment ${
                  active ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 hover:border-ink-red/70'
                }`}
              >
                <p className="font-display text-sm tracking-[0.1em] uppercase text-ink-navy">
                  {t(`ref.equipment.weapons.${weaponId}`)}
                </p>
                <p className="font-body text-xs text-ink-navy/60">
                  {t('sheet.label.load')} {entry.load}
                </p>
              </button>
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
      <h3 className="font-display text-base tracking-[0.18em] uppercase text-ink-red border-b border-ink-red/30 pb-1">
        {title}
      </h3>
      {children}
    </section>
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
