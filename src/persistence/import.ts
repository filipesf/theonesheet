import { migrateV0ToV0 } from '../domain/migrations/v0';
import type { Character, ExportedCharacterFile } from '../domain/types';

export type ImportResult =
  | { ok: true; character: Character }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isExportFile(value: unknown): value is ExportedCharacterFile {
  if (!isRecord(value)) {
    return false;
  }
  return value.schemaVersion === 'v0' && value.app === 'the-one-sheet' && isRecord(value.character);
}

export function importCharacterFromJson(content: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, error: 'Invalid JSON file.' };
  }

  if (!isExportFile(parsed)) {
    return { ok: false, error: 'Incompatible file format or schema version.' };
  }

  const character = parsed.character as Character;
  return { ok: true, character: migrateV0ToV0(character) };
}
