import { useTranslation } from 'react-i18next';
import type { CharacterRecord } from '../../persistence/local-storage';

type CharacterCardProps = {
  record: CharacterRecord;
  isActive: boolean;
  cultureLabel: string;
  callingLabel: string;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function CharacterCard({
  record,
  isActive,
  cultureLabel,
  callingLabel,
  onView,
  onEdit,
  onDuplicate,
  onRename,
  onDelete,
}: CharacterCardProps) {
  const { t } = useTranslation();
  const character = record.character;
  const displayName = character.name?.trim() || record.name || t('card.untitled-hero');

  return (
    <article
      className={`group relative bg-parchment-soft border-2 ${
        isActive ? 'border-ink-red' : 'border-ink-red/50'
      } shadow-[0_1px_0_rgba(163,48,36,0.15),0_8px_24px_-12px_rgba(31,44,92,0.25)] hover:-translate-y-0.5 hover:shadow-[0_2px_0_rgba(163,48,36,0.2),0_12px_32px_-12px_rgba(31,44,92,0.35)] transition-all`}
    >
      <div className="border border-ink-red/40 m-1.5 flex flex-col">
        <button
          type="button"
          onClick={onView}
          className="text-left px-5 pt-5 pb-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-inset"
        >
          <p className="font-label text-[10px] tracking-[0.25em] uppercase text-ink-red/80">
            {cultureLabel}
            {callingLabel ? <span className="mx-2 text-ink-red/40">·</span> : null}
            {callingLabel}
          </p>
          <h2 className="mt-1 font-hand text-3xl text-ink-navy leading-tight truncate">
            {displayName}
          </h2>

          <dl className="mt-4 grid grid-cols-3 gap-2">
            <AttributePill label={t('card.attr.str')} value={character.attributes.strength} />
            <AttributePill label={t('card.attr.hrt')} value={character.attributes.heart} />
            <AttributePill label={t('card.attr.wts')} value={character.attributes.wits} />
          </dl>

          <div className="mt-4 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-label text-[10px] tracking-wider uppercase text-ink-red/80">
              {t('card.endurance')}
            </span>
            <span className="font-hand text-base text-ink-navy">
              {character.current_endurance}
              <span className="text-ink-navy/40 mx-1">/</span>
              {character.max_endurance}
            </span>
            <span className="font-label text-[10px] tracking-wider uppercase text-ink-red/80 ml-3">
              {t('card.hope')}
            </span>
            <span className="font-hand text-base text-ink-navy">
              {character.current_hope}
              <span className="text-ink-navy/40 mx-1">/</span>
              {character.max_hope}
            </span>
          </div>
        </button>

        <div className="grid grid-cols-4 border-t border-ink-red/30 mt-1">
          <CardAction onClick={onView}>{t('card.action.view')}</CardAction>
          <CardAction onClick={onEdit}>{t('card.action.edit')}</CardAction>
          <CardAction onClick={onDuplicate}>{t('card.action.duplicate')}</CardAction>
          <CardAction onClick={onRename}>{t('card.action.rename')}</CardAction>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="border-t border-ink-red/30 px-3 py-2 font-label text-[10px] tracking-[0.22em] uppercase text-ink-red/80 hover:bg-ink-red/10 hover:text-ink-red cursor-pointer transition-colors focus:outline-none focus-visible:bg-ink-red/15"
        >
          {t('card.action.delete')}
        </button>
      </div>
    </article>
  );
}

function AttributePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-label text-[8px] tracking-[0.18em] uppercase text-ink-red/75">
        {label}
      </span>
      <span className="relative inline-flex h-10 w-10 items-center justify-center">
        <span className="absolute inset-0 rotate-45 border border-ink-red/60" aria-hidden="true" />
        <span className="relative font-hand text-xl text-ink-navy">{value}</span>
      </span>
    </div>
  );
}

function CardAction({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-2 font-label text-[10px] tracking-[0.22em] uppercase text-ink-red/85 hover:bg-ink-red/10 hover:text-ink-red cursor-pointer transition-colors focus:outline-none focus-visible:bg-ink-red/15 border-r last:border-r-0 border-ink-red/20"
    >
      {children}
    </button>
  );
}
