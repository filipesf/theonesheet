import { useEffect, useState } from 'react';

export type Route =
  | { name: 'library' }
  | { name: 'characterNew' }
  | { name: 'characterEditor'; id: string }
  | { name: 'characterPrinted'; id: string }
  | { name: 'settings' };

function normaliseHash(hash: string): string {
  return hash
    .replace(/^#\/?/, '')
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '');
}

function parseHash(hash: string): Route {
  const trimmed = normaliseHash(hash);
  if (!trimmed || trimmed === 'library') {
    return { name: 'library' };
  }
  if (trimmed === 'character/new') return { name: 'characterNew' };
  if (trimmed === 'settings') return { name: 'settings' };

  const printedMatch = trimmed.match(/^character\/([^/]+)\/sheet$/);
  if (printedMatch) {
    return { name: 'characterPrinted', id: decodeURIComponent(printedMatch[1]!) };
  }
  const editorMatch = trimmed.match(/^character\/([^/]+)$/);
  if (editorMatch && editorMatch[1] !== 'new') {
    return { name: 'characterEditor', id: decodeURIComponent(editorMatch[1]!) };
  }
  // Legacy bookmark: #/sheet/:id → printed view.
  const legacySheetMatch = trimmed.match(/^sheet\/([^/]+)$/);
  if (legacySheetMatch) {
    return { name: 'characterPrinted', id: decodeURIComponent(legacySheetMatch[1]!) };
  }
  return { name: 'library' };
}

export function buildHash(route: Route): string {
  switch (route.name) {
    case 'library':
      return '#/';
    case 'characterNew':
      return '#/character/new';
    case 'characterEditor':
      return `#/character/${encodeURIComponent(route.id)}`;
    case 'characterPrinted':
      return `#/character/${encodeURIComponent(route.id)}/sheet`;
    case 'settings':
      return '#/settings';
  }
}

export function navigate(route: Route): void {
  const next = buildHash(route);
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

/**
 * Rewrites legacy hashes (`#/library`, `#/sheet/:id`) to the canonical shape
 * via `history.replaceState` so bookmarks keep working without a flicker.
 */
export function redirectLegacyHashIfNeeded(): void {
  const trimmed = normaliseHash(window.location.hash);
  if (trimmed === 'library') {
    window.history.replaceState(null, '', buildHash({ name: 'library' }));
    return;
  }
  const legacy = trimmed.match(/^sheet\/([^/]+)$/);
  if (legacy) {
    window.history.replaceState(
      null,
      '',
      buildHash({ name: 'characterPrinted', id: decodeURIComponent(legacy[1]!) }),
    );
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => {
    redirectLegacyHashIfNeeded();
    return parseHash(window.location.hash);
  });
  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}

export { parseHash };
