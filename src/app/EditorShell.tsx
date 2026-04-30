import { useTranslation } from 'react-i18next';
import type { Character } from '../domain/types';
import { PrintedCharacterSheet } from '../features/sheet/PrintedCharacterSheet';
import { buildHash } from './router';

type Props = {
  character: Character;
  onChange: (character: Character) => void;
};

export function EditorShell({ character, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 sm:py-8">
      <div className="no-print mb-4 flex justify-end">
        <a
          href={buildHash({ name: 'characterPrinted', id: character.id })}
          className="font-label text-eyebrow tracking-[0.2em] uppercase border border-ink-red/60 text-ink-red px-4 py-2.5 hover:bg-ink-red hover:text-parchment-soft transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-red focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
        >
          {t('editor.print')}
        </a>
      </div>
      <PrintedCharacterSheet character={character} onChange={onChange} />
    </main>
  );
}
