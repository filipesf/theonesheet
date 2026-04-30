import type { TFunction } from 'i18next';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../app/ui/Modal';
import { sanitiseDigits } from '../../app/ui/numeric-input';
import { GhostButton, PrimaryButton } from '../../app/ui/dialog-buttons';
import { appendLog, clearLog, readLog } from './diceLogStorage';
import {
  classifyFeat,
  evaluate,
  type RollRequest,
  type RollResult,
  type SuccessFace,
} from './diceMechanics';
import { rollViaStage } from './diceStageRegistry';
import { useDiceTray } from './useDiceTray';

const MAX_DICE = 6;

export function DiceTray() {
  const { t } = useTranslation();
  const tray = useDiceTray();
  const [label, setLabel] = useState('');
  const [successDice, setSuccessDice] = useState(2);
  const [tn, setTn] = useState<string>('');
  const [weary, setWeary] = useState(false);
  const [miserable, setMiserable] = useState(false);
  const [latest, setLatest] = useState<RollResult | null>(null);
  const [logVersion, setLogVersion] = useState(0);
  const [rolling, setRolling] = useState(false);

  const recentLog = useMemo(() => {
    if (!tray.characterId) return [];
    return readLog(tray.characterId).slice(0, 5);
    // logVersion tracks log mutations triggered by this tray instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tray.characterId, tray.open, logVersion]);

  useEffect(() => {
    if (!tray.open || !tray.prefill) return;
    if (tray.prefill.label !== undefined) setLabel(tray.prefill.label);
    if (tray.prefill.successDice !== undefined)
      setSuccessDice(Math.max(1, Math.min(MAX_DICE, tray.prefill.successDice)));
    if (tray.prefill.tn !== undefined && tray.prefill.tn !== null)
      setTn(String(tray.prefill.tn));
    if (tray.prefill.weary !== undefined) setWeary(tray.prefill.weary);
    if (tray.prefill.miserable !== undefined) setMiserable(tray.prefill.miserable);
  }, [tray.open, tray.prefill]);

  async function handleRoll() {
    if (rolling) return;
    const parsedTn = tn.trim() === '' ? null : Number(tn);
    const request: RollRequest = {
      label: label.trim() || t('dice.tray.unnamed-roll'),
      successDice,
      tn: Number.isFinite(parsedTn) ? parsedTn : null,
      weary,
      miserable,
      characterId: tray.characterId,
    };
    setRolling(true);
    try {
      const stageResult = await rollViaStage(1, successDice);
      const featRaw = stageResult?.featRaw ?? 1 + Math.floor(Math.random() * 12);
      const successFaces: SuccessFace[] = stageResult
        ? (stageResult.successFaces.map((v) => v as SuccessFace))
        : Array.from(
            { length: successDice },
            () => (1 + Math.floor(Math.random() * 6)) as SuccessFace,
          );
      const result = evaluate(request, classifyFeat(featRaw), successFaces);
      if (tray.characterId) {
        appendLog(tray.characterId, result);
      }
      setLatest(result);
      setLogVersion((v) => v + 1);
    } finally {
      setRolling(false);
    }
  }

  function handleClearLog() {
    if (!tray.characterId) return;
    clearLog(tray.characterId);
    setLatest(null);
    setLogVersion((v) => v + 1);
  }

  return (
    <Modal
      open={tray.open}
      onClose={tray.hide}
      title={t('dice.tray.title')}
      footer={
        <>
          <GhostButton onClick={tray.hide}>{t('dice.tray.close')}</GhostButton>
          <PrimaryButton onClick={handleRoll} disabled={rolling}>
            {rolling ? t('dice.tray.rolling') : t('dice.tray.roll')}
          </PrimaryButton>
        </>
      }
    >
      <div data-dice="ui" className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-label text-microlabel tracking-label uppercase text-ink-red">
            {t('dice.tray.label')}
          </span>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="bg-transparent border-0 border-b border-ink-red/60 outline-none focus:border-ink-red focus-visible:bg-ink-red/5 font-hand text-xl text-ink-navy py-1 transition-colors"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-label text-microlabel tracking-label uppercase text-ink-red">
              {t('dice.tray.success-dice')}
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={successDice}
              onChange={(event) =>
                setSuccessDice(
                  Math.max(1, Math.min(MAX_DICE, sanitiseDigits(event.target.value) || 1)),
                )
              }
              className="bg-transparent border border-ink-red/40 outline-none focus:border-ink-red focus-visible:bg-ink-red/5 px-2 py-1 font-hand text-lg text-ink-navy transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label text-microlabel tracking-label uppercase text-ink-red">
              {t('dice.tray.tn')}
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tn}
              onChange={(event) => setTn(event.target.value.replace(/\D/g, ''))}
              placeholder={t('common.dash')}
              className="bg-transparent border border-ink-red/40 outline-none focus:border-ink-red focus-visible:bg-ink-red/5 px-2 py-1 font-hand text-lg text-ink-navy transition-colors"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          <Toggle
            checked={weary}
            onChange={setWeary}
            label={t('dice.tray.weary')}
          />
          <Toggle
            checked={miserable}
            onChange={setMiserable}
            label={t('dice.tray.miserable')}
          />
        </div>

        {latest && <ResultCard result={latest} />}

        {recentLog.length > 0 && (
          <section className="border-t border-ink-red/30 pt-3 mt-1">
            <header className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm tracking-label uppercase text-ink-red">
                {t('dice.log.heading')}
              </h3>
              <button
                type="button"
                onClick={handleClearLog}
                className="font-label text-microlabel tracking-label uppercase text-ink-red/70 hover:text-ink-red underline-offset-4 hover:underline cursor-pointer focus:outline-none focus-visible:underline px-2 py-2"
              >
                {t('dice.log.clear')}
              </button>
            </header>
            <ul className="flex flex-col gap-1.5">
              {recentLog.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 border border-ink-red/20 bg-parchment-soft/40 px-2 py-1"
                >
                  <span className="font-body text-sm text-ink-navy truncate">
                    {entry.request.label}
                  </span>
                  <span className="font-label text-microlabel tracking-label uppercase text-ink-navy/70 shrink-0">
                    {t(`dice.outcome.${entry.outcome}`)} · {entry.total}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-ink-red"
      />
      <span className="font-body text-sm text-ink-navy">{label}</span>
    </label>
  );
}

function ResultCard({ result }: { result: RollResult }) {
  const { t } = useTranslation();
  return (
    <article className="border border-ink-red/40 bg-parchment-soft/60 p-3 mt-2">
      <header className="flex items-center justify-between">
        <span className="font-display text-sm tracking-label uppercase text-ink-red">
          {result.request.label}
        </span>
        <span className="font-label text-microlabel tracking-label uppercase text-ink-navy/70">
          {t(`dice.outcome.${result.outcome}`)}
        </span>
      </header>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <FaceBadge label={t('dice.feat.face')} value={featLabel(result.feat, t)} large />
        {result.successDice.map((face, index) => (
          <FaceBadge key={index} label="d6" value={String(face)} />
        ))}
      </div>
      <p className="mt-2 font-body text-sm text-ink-navy/80">
        {t('dice.result.total', { total: result.total })}
        {result.request.tn !== null && (
          <> · {t('dice.result.tn', { tn: result.request.tn })}</>
        )}
        {result.successes > 0 && (
          <> · {t('dice.result.tengwar', { count: result.successes })}</>
        )}
      </p>
    </article>
  );
}

function FaceBadge({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <span
      className={`inline-flex flex-col items-center justify-center border-2 border-ink-red/60 ${
        large ? 'h-12 w-12' : 'h-9 w-9'
      } bg-parchment`}
    >
      <span className="font-label text-microline tracking-label uppercase text-ink-red/70 leading-none">
        {label}
      </span>
      <span className={`font-hand text-ink-navy ${large ? 'text-xl' : 'text-base'}`}>
        {value}
      </span>
    </span>
  );
}

function featLabel(feat: RollResult['feat'], t: TFunction): string {
  if (feat === 'gandalf') return t('dice.feat.gandalf');
  if (feat === 'eye') return t('dice.feat.eye');
  return String(feat);
}
