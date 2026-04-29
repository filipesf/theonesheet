import { useEffect } from 'react';
import type { Character } from '../domain/types';
import { PrintedCharacterSheet } from '../features/sheet/PrintedCharacterSheet';

type Props = {
  character: Character;
  onChange: (character: Character) => void;
};

// TODO(v0): printed view is read+edit until the editor split lands (see Wave 3+).
export function PrintedShell({ character, onChange }: Props) {
  useEffect(() => {
    document.body.dataset.view = 'printed';
    return () => {
      delete document.body.dataset.view;
    };
  }, []);

  return (
    <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 sm:py-8">
      <PrintedCharacterSheet character={character} onChange={onChange} />
    </main>
  );
}
