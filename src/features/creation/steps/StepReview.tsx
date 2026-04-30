import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validateCreation, type CreationIssue } from '../../../domain/creation';
import { callingKey, heroicCultureKey } from '../../../ref-data/labels';
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
      <h2 className="font-display text-2xl tracking-display text-ink-navy">
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
          <Row
            label={t('sheet.label.heroic-culture')}
            value={t(heroicCultureKey(character.heroic_culture))}
          />
          <Row
            label={t('sheet.label.calling')}
            value={t(callingKey(character.calling))}
          />
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
          <h3 className="font-display text-sm tracking-label uppercase text-ink-red">
            {t('creation.step.review.blocking-title')}
          </h3>
          <ul className="list-disc pl-5 mt-1 font-body text-sm text-ink-red">
            {blockingIssues.map((issue) => (
              <IssueItem key={`${issue.field}-${issue.code}`} issue={issue} />
            ))}
          </ul>
        </section>
      )}

      {draftIssues.length > 0 && (
        <section>
          <h3 className="font-display text-sm tracking-label uppercase text-ink-navy/70">
            {t('creation.step.review.warnings-title')}
          </h3>
          <ul className="list-disc pl-5 mt-1 font-body text-sm text-ink-navy/70">
            {draftIssues.map((issue) => (
              <IssueItem key={`${issue.field}-${issue.code}`} issue={issue} />
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

function IssueItem({ issue }: { issue: CreationIssue }) {
  const { t } = useTranslation();
  const fieldLabel = t(`creation.field.${issue.field}`, { defaultValue: issue.field });
  const message = t(`creation.issue.${issue.code}`, issue.data ?? {});
  return (
    <li>
      {fieldLabel}: {message}
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <dt className="font-label text-microlabel tracking-label uppercase text-ink-red/80">{label}</dt>
      <dd className="font-hand text-lg text-ink-navy">{value || t('common.dash')}</dd>
    </div>
  );
}
