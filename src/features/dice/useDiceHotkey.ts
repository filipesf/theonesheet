import { useEffect } from 'react';
import { toggleDiceTray } from './useDiceTray';

export function useDiceHotkey() {
  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key !== 'd' && event.key !== 'D') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      toggleDiceTray();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
