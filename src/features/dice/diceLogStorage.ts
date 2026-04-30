import type { RollResult } from './diceMechanics';

const KEY = (characterId: string) => `tos:dice-log:${characterId}`;
const CAP = 100;

export function readLog(characterId: string): RollResult[] {
  try {
    const raw = window.localStorage.getItem(KEY(characterId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RollResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendLog(characterId: string, result: RollResult): RollResult[] {
  const next = [result, ...readLog(characterId)].slice(0, CAP);
  window.localStorage.setItem(KEY(characterId), JSON.stringify(next));
  return next;
}

export function clearLog(characterId: string): void {
  window.localStorage.removeItem(KEY(characterId));
}
