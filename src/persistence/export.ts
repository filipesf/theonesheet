import type { Character, ExportedCharacterFile } from '../domain/types';

export function createExportPayload(character: Character): ExportedCharacterFile {
  return {
    schemaVersion: 'v0',
    app: 'the-one-sheet',
    exportedAt: new Date().toISOString(),
    character,
  };
}

export function serialiseCharacter(character: Character): string {
  return JSON.stringify(createExportPayload(character), null, 2);
}
