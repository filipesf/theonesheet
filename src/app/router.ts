import { useEffect, useState } from 'react';

export type Route =
  | { name: 'library' }
  | { name: 'sheet'; id: string };

function parseHash(hash: string): Route {
  const trimmed = hash.replace(/^#\/?/, '');
  if (!trimmed || trimmed === 'library') {
    return { name: 'library' };
  }
  const sheetMatch = trimmed.match(/^sheet\/([^/?#]+)/);
  if (sheetMatch) {
    return { name: 'sheet', id: decodeURIComponent(sheetMatch[1]!) };
  }
  return { name: 'library' };
}

export function buildHash(route: Route): string {
  if (route.name === 'library') return '#/library';
  return `#/sheet/${encodeURIComponent(route.id)}`;
}

export function navigate(route: Route): void {
  const next = buildHash(route);
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return route;
}
