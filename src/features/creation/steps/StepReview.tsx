import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validateCreation } from '../../../domain/creation';
import { draftToCharacter } from '../draftToCharacter';
import type { CreationDraft } from '../creationSchema';

export function StepReview() {
  const { t } = useTranslation();
  const { getValues, formState } = useFormContext<CreationDraft>();
  const draft = getValues();

  const { character, blockingIssues, draftIssues } = useMemo(() => {
    if (!formState.isValid) {
      return { character: null, blockingIssues: [], draftIssues: [] };
    }
    const character = draftToCharacter(draft);
    const issues = validateCreation(character);
    return {
      character,
      blockingIssues: issues.filter((i) => i.blocking),
      draftIssues: issues.filter((i) => !i.blocking),
    };
  }, [draft, formState.isValid]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl tracking-[0.06em] text-ink-navy">
        {t('creation.step.review.title')}
      </h2>
      <p className="font-body text-base text-ink-navy/70">
        {t('creation.step.review.body')}
      </p>

      {!formState.isValid && (
        <p role="alert" className="font-body text-base text-ink-red">
          {t('creation.step.review.invalid')}
        </p>
      )}

      {character && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border border-ink-red/30 p-4 bg-parchment-soft/40">
          <Row label={t('sheet.label.name')} value={character.name} />
          <Row label={t('sheet.label.heroic-culture')} value={character.heroic_culture} />
          <Row label={t('sheet.label.calling')} value={character.calling} />
          <Row label={t('sheet.label.age')} value={String(character.age)} />
          <Row label={t('sheet.attribute.strength')} value={String(character.attributes.strength)} />
          <Row label={t('sheet.attribute.heart')} value={String(character.attributes.heart)} />
          <Row label={t('sheet.attribute.wits')} value={String(character.attributes.wits)} />
          <Row label={t('sheet.label.derived.endurance')} value={String(character.max_endurance)} />
          <Row label={t('sheet.label.derived.hope')} value={String(character.max_hope)} />
          <Row label={t('sheet.label.derived.parry')} value={String(character.effective_parry)} />
          <Row
            label={t('sheet.label.distinctive-features')}
            value={character.distinctive_features.join(', ')}
          />
          <Row label={t('sheet.section.rewards')} value={character.rewards.map((r) => r.name).join(', ')} />
          <Row label={t('sheet.section.virtues')} value={character.virtues.map((v) => v.name).join(', ')} />
        </dl>
      )}

      {blockingIssues.length > 0 && (
        <section>
          <h3 className="font-display text-sm tracking-[0.18em] uppercase text-ink-red">
            {t('creation.step.review.blocking-title')}
          </h3>
          <ul className="list-disc pl-5 mt-1 font-body text-sm text-ink-red">
            {blockingIssues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>
                {issue.field}: {issue.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {draftIssues.length > 0 && (
        <section>
          <h3 className="font-display text-sm tracking-[0.18em] uppercase text-ink-navy/70">
            {t('creation.step.review.warnings-title')}
          </h3>
          <ul className="list-disc pl-5 mt-1 font-body text-sm text-ink-navy/70">
            {draftIssues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>
                {issue.field}: {issue.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="font-body text-sm text-ink-navy/60 italic mt-2">
        {t('creation.step.review.phase9-note')}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-label text-[10px] tracking-[0.22em] uppercase text-ink-red/80">{label}</dt>
      <dd className="font-hand text-lg text-ink-navy">{value || '—'}</dd>
    </div>
  );
}
