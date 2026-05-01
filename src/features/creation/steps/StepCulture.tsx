import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectionCard } from '../../../app/ui/SelectionCard';
import { HEROIC_CULTURES, type HeroicCulture } from '../../../domain/types';
import { BLESSINGS_BY_ID } from '../../../ref-data/blessings';
import { CULTURES, MEDIAN_AGE_BY_CULTURE } from '../../../ref-data/cultures';
import { CULTURAL_UNDERLINED_SKILLS } from '../../../ref-data/cultural-skills';
import { heroicCultureKey } from '../../../ref-data/labels';
import type { CreationDraft } from '../creationSchema';

const ATTRIBUTE_CHOICES = ['strength', 'heart', 'wits'] as const;

export function StepCulture() {
  const { t } = useTranslation();
  const { control, setValue, formState } = useFormContext<CreationDraft>();
  const culture = useWatch({ control, name: 'heroic_culture' });
  const blessingChoice = useWatch({ control, name: 'cultural_blessing_choice' });
  const underlinedPick = useWatch({ control, name: 'underlined_skill_pick' });

  const blessingId = culture ? CULTURES[culture].blessingId : null;
  const blessing = blessingId ? BLESSINGS_BY_ID.get(blessingId) : null;
  const requiresAttributeChoice = blessing?.effects.some(
    (effect) => effect.kind === 'attribute-plus' && effect.attribute === 'choose',
  );
  const underlinedPair = culture ? CULTURAL_UNDERLINED_SKILLS[culture] : null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
        {t('creation.step.culture.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.culture.body')}
      </p>
      <Controller
        name="heroic_culture"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HEROIC_CULTURES.map((c: HeroicCulture) => {
              const active = field.value === c;
              const meta = CULTURES[c];
              return (
                <SelectionCard
                  key={c}
                  active={active}
                  onClick={() => {
                    field.onChange(c);
                    if (!formState.dirtyFields.age) {
                      setValue('age', MEDIAN_AGE_BY_CULTURE[c], { shouldValidate: true });
                    }
                    setValue('cultural_blessing_choice', null, { shouldValidate: true });
                    setValue('underlined_skill_pick', null, { shouldValidate: true });
                  }}
                >
                  <p className="font-display text-base tracking-section uppercase text-ink-navy">
                    {t(heroicCultureKey(c))}
                  </p>
                  <p className="font-body text-sm text-ink-navy/70 mt-1">
                    {t('creation.step.culture.blessing-label')}: {t(`ref.blessings.${meta.blessingId}`)}
                  </p>
                </SelectionCard>
              );
            })}
          </div>
        )}
      />

      {requiresAttributeChoice && (
        <section className="flex flex-col gap-2">
          <h3 className="font-display text-base tracking-label uppercase text-ink-red border-b border-ink-red/30 pb-1">
            {t('creation.step.culture.blessing-attribute-title')}
          </h3>
          <p className="font-body text-sm text-ink-navy/70">
            {t('creation.step.culture.blessing-attribute-body')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ATTRIBUTE_CHOICES.map((attribute) => {
              const active =
                blessingChoice?.kind === 'attribute-plus' &&
                blessingChoice.attribute === attribute;
              return (
                <SelectionCard
                  key={attribute}
                  active={active}
                  padding="sm"
                  onClick={() =>
                    setValue(
                      'cultural_blessing_choice',
                      { kind: 'attribute-plus', attribute },
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
        </section>
      )}

      {underlinedPair && (
        <section className="flex flex-col gap-2">
          <h3 className="font-display text-base tracking-label uppercase text-ink-red border-b border-ink-red/30 pb-1">
            {t('creation.step.culture.underlined-skill-title')}
          </h3>
          <p className="font-body text-sm text-ink-navy/70">
            {t('creation.step.culture.underlined-skill-body')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {underlinedPair.map((skillId) => {
              const active = underlinedPick === skillId;
              return (
                <SelectionCard
                  key={skillId}
                  active={active}
                  padding="sm"
                  onClick={() =>
                    setValue('underlined_skill_pick', skillId, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <span className="font-display text-sm tracking-section uppercase text-ink-navy">
                    {t(`ref.skills.${skillId}`)}
                  </span>
                </SelectionCard>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
