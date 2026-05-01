import type { CreationDraft } from './creationSchema';

// Bump when CreationDraft's shape changes in a way that would break
// rehydration (renamed fields, removed enum members, length-locked
// arrays growing/shrinking). On mismatch we drop the persisted draft
// rather than attempt a migration — wizard state is short-lived and
// the user has not yet committed to anything saveable.
export const DRAFT_SCHEMA_VERSION = 1;

export const DRAFT_STORAGE_KEY = 'the-one-sheet:v0:wizard-draft';

type StoredDraft = {
  schemaVersion: number;
  draft: CreationDraft;
  stepIndex: number;
};

export type LoadedDraft = {
  draft: CreationDraft;
  stepIndex: number;
};

export function loadDraft(): LoadedDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredDraft;
    if (parsed.schemaVersion !== DRAFT_SCHEMA_VERSION) return null;
    if (!parsed.draft || typeof parsed.stepIndex !== 'number') return null;
    return { draft: parsed.draft, stepIndex: parsed.stepIndex };
  } catch {
    return null;
  }
}

export function saveDraft(payload: LoadedDraft): void {
  if (typeof window === 'undefined') return;
  const stored: StoredDraft = {
    schemaVersion: DRAFT_SCHEMA_VERSION,
    draft: payload.draft,
    stepIndex: payload.stepIndex,
  };
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Quota or serialisation error: drop silently. The wizard remains
    // functional in-memory and the user has not yet relied on the draft
    // surviving a reload.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}
