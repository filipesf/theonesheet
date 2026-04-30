import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CALLINGS, STANDARD_OF_LIVING, type Calling, type StandardOfLiving } from '../../../domain/types';
import { callingKey, standardOfLivingKey } from '../../../ref-data/labels';
import { CALLINGS_DATA } from '../content/callings';
import { CALLING_FEATURES } from '../content/distinctive-features';
import { STARTING_EQUIPMENT } from '../content/starting-equipment';
import { STARTING_REWARDS } from '../content/starting-rewards';
import { STARTING_VIRTUES } from '../content/starting-virtues';
import type { CreationDraft } from '../creationSchema';

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

  const equipment = STARTING_EQUIPMENT[sol];
  const featurePool = CALLING_FEATURES[calling];

  function toggleWeapon(weapon: { type: string; load: number }) {
    const exists = weapons.find((w) => w.type === weapon.type);
    const next = exists
      ? weapons.filter((w) => w.type !== weapon.type)
      : weapons.length < 4
        ? [...weapons, weapon]
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
              className={`p-3 border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red ${
                calling === c ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 hover:border-ink-red/70'
              }`}
            >
              <p className="font-display text-sm tracking-[0.12em] uppercase text-ink-navy">
                {t(callingKey(c))}
              </p>
              <p className="font-body text-xs text-ink-navy/60 mt-1">
                {CALLINGS_DATA[c].shadow_path}
              </p>
            </button>
          ))}
        </div>
      </Block>

      <Block title={t('creation.step.calling.calling-feature')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {featurePool.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() =>
                setValue('calling_feature', feature, { shouldDirty: true, shouldValidate: true })
              }
              aria-pressed={callingFeature === feature}
              className={`p-3 text-left border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red ${
                callingFeature === feature ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 hover:border-ink-red/70'
              }`}
            >
              <span className="font-display text-sm tracking-[0.1em] uppercase text-ink-navy">
                {feature}
              </span>
            </button>
          ))}
        </div>
      </Block>

      <Block title={t('creation.step.calling.starting-reward')}>
        <SelectRow value={startingReward} options={STARTING_REWARDS} onChange={(v) => setValue('starting_reward', v, { shouldDirty: true, shouldValidate: true })} />
      </Block>

      <Block title={t('creation.step.calling.starting-virtue')}>
        <SelectRow value={startingVirtue} options={STARTING_VIRTUES} onChange={(v) => setValue('starting_virtue', v, { shouldDirty: true, shouldValidate: true })} />
      </Block>

      <Block title={t('creation.step.calling.standard-of-living')}>
        <select
          {...register('standard_of_living')}
          className="bg-parchment-soft border border-ink-red/40 px-3 py-2 font-body text-base text-ink-navy"
        >
          {STANDARD_OF_LIVING.map((s: StandardOfLiving) => (
            <option key={s} value={s}>{t(standardOfLivingKey(s))}</option>
          ))}
        </select>
      </Block>

      <Block title={t('creation.step.calling.weapons', { count: weapons.length, max: 4 })}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {equipment.weapons.map((weapon) => {
            const active = weapons.some((w) => w.type === weapon.type);
            return (
              <button
                key={weapon.type}
                type="button"
                onClick={() => toggleWeapon(weapon)}
                aria-pressed={active}
                className={`p-3 text-left border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red ${
                  active ? 'border-ink-red bg-parchment-soft' : 'border-ink-red/40 hover:border-ink-red/70'
                }`}
              >
                <p className="font-display text-sm tracking-[0.1em] uppercase text-ink-navy">{weapon.type}</p>
                <p className="font-body text-xs text-ink-navy/60">{t('sheet.label.load')} {weapon.load}</p>
              </button>
            );
          })}
        </div>
      </Block>

      <Block title={t('creation.step.calling.armour')}>
        <SelectRow
          value={armour?.type ?? ''}
          options={['', ...equipment.armours.map((a) => a.type)]}
          onChange={(value) => {
            const match = equipment.armours.find((a) => a.type === value);
            setValue('armour', match ?? null, { shouldDirty: true, shouldValidate: true });
          }}
        />
      </Block>

      <Block title={t('creation.step.calling.shield')}>
        <SelectRow
          value={shield?.type ?? ''}
          options={['', ...equipment.shields.map((s) => s.type)]}
          onChange={(value) => {
            const match = equipment.shields.find((s) => s.type === value);
            setValue('shield', match ?? null, { shouldDirty: true, shouldValidate: true });
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
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="bg-parchment-soft border border-ink-red/40 px-3 py-2 font-body text-base text-ink-navy"
    >
      {options.map((option) => (
        <option key={option || 'empty'} value={option}>
          {option || '—'}
        </option>
      ))}
    </select>
  );
}
