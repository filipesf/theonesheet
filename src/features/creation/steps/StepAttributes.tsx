import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectionCard } from '../../../app/ui/SelectionCard';
import { ATTRIBUTE_SETS } from '../../../ref-data/attribute-sets';
import type { CreationDraft } from '../creationSchema';

export function StepAttributes() {
  const { t } = useTranslation();
  const { setValue, control } = useFormContext<CreationDraft>();
  const culture = useWatch({ control, name: 'heroic_culture' });
  const selected = useWatch({ control, name: 'attribute_set_index' });

  const sets = ATTRIBUTE_SETS[culture];

  function pick(index: number) {
    const set = sets[index]!;
    setValue('attribute_set_index', index, { shouldValidate: true, shouldDirty: true });
    setValue('strength', set.strength, { shouldValidate: true });
    setValue('heart', set.heart, { shouldValidate: true });
    setValue('wits', set.wits, { shouldValidate: true });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
        {t('creation.step.attributes.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.attributes.body')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sets.map((set, index) => {
          const active = selected === index;
          return (
            <SelectionCard key={index} active={active} onClick={() => pick(index)}>
              <p className="font-label text-microlabel tracking-label uppercase text-ink-red mb-2">
                {t('creation.step.attributes.set-label', { index: index + 1 })}
              </p>
              <ul className="grid grid-cols-3 gap-2 text-center">
                <Pill label={t('sheet.attribute.strength')} value={set.strength} />
                <Pill label={t('sheet.attribute.heart')} value={set.heart} />
                <Pill label={t('sheet.attribute.wits')} value={set.wits} />
              </ul>
            </SelectionCard>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: number }) {
  return (
    <li>
      <p className="font-label text-microcaption tracking-label uppercase text-ink-red/80">{label}</p>
      <p className="font-hand text-2xl text-ink-navy">{value}</p>
    </li>
  );
}
