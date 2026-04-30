import { useSyncExternalStore } from 'react';
import type { RollRequest } from './diceMechanics';

type TrayState = {
  open: boolean;
  characterId: string | null;
  prefill: Partial<RollRequest> | null;
};

let state: TrayState = { open: false, characterId: null, prefill: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TrayState {
  return state;
}

function set(next: Partial<TrayState>) {
  state = { ...state, ...next };
  emit();
}

/**
 * Stable setters — safe to use as `useEffect` dependencies without
 * triggering a re-subscribe loop. Prefer these over the controller methods
 * returned by `useDiceTray()` inside effects.
 */
export function setDiceTrayCharacter(id: string | null): void {
  if (state.characterId === id) return;
  set({ characterId: id });
}

export function toggleDiceTray(): void {
  set({ open: !state.open });
}

export type DiceTrayController = {
  open: boolean;
  characterId: string | null;
  prefill: Partial<RollRequest> | null;
  toggle: () => void;
  show: () => void;
  hide: () => void;
  setActiveCharacter: (id: string | null) => void;
  openWith: (prefill: Partial<RollRequest>) => void;
};

export function useDiceTray(): DiceTrayController {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    open: snapshot.open,
    characterId: snapshot.characterId,
    prefill: snapshot.prefill,
    toggle: () => set({ open: !state.open }),
    show: () => set({ open: true }),
    hide: () => set({ open: false, prefill: null }),
    setActiveCharacter: (id) => set({ characterId: id }),
    openWith: (prefill) => set({ open: true, prefill }),
  };
}
