import { useTranslation } from 'react-i18next';
import { getCreationValidationSummary } from './validation';
import type { Character } from '../../domain/types';

type Props = {
  character: Character;
  onApplyBelbaPreset: () => void;
};

export function CreationPanel({ character, onApplyBelbaPreset }: Props) {
  const { t } = useTranslation();
  const summary = getCreationValidationSummary(character);

  return (
    <section className="editor-panel">
      <h3>{t('creation.heading')}</h3>
      <p>{t('creation.intro')}</p>
      <button type="button" onClick={onApplyBelbaPreset}>
        {t('creation.apply-belba')}
      </button>

      <div className="creation-status-grid">
        <article>
          <h4>{t('creation.blocking-title')}</h4>
          {summary.blocking.length === 0 ? (
            <p>{t('creation.none')}</p>
          ) : (
            summary.blocking.map((item) => <p key={item}>{item}</p>)
          )}
        </article>
        <article>
          <h4>{t('creation.warnings-title')}</h4>
          {summary.draftWarnings.length === 0 ? (
            <p>{t('creation.none')}</p>
          ) : (
            summary.draftWarnings.map((item) => <p key={item}>{item}</p>)
          )}
        </article>
      </div>

      <p>
        {t('creation.finalise-status')}
        <strong>{summary.canFinalise ? t('creation.ready') : t('creation.blocked')}</strong>
      </p>
    </section>
  );
}
