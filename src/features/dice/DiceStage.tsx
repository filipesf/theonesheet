import type DiceBox from '@3d-dice/dice-box';
import { useEffect, useRef } from 'react';
import { registerStage, type StageRollResult } from './diceStageRegistry';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const CONTAINER_ID = 'tos-dice-stage';
const CANVAS_ID = 'tos-dice-stage-canvas';
const ASSET_PATH = `${import.meta.env.BASE_URL}dice-box-assets/`;
const RESIZE_DEBOUNCE_MS = 200;
const MAX_CANVAS_DIMENSION = 4096;
const ACCENT_FALLBACK = '#a33024';

function readAccentColour(): string {
  if (typeof window === 'undefined') return ACCENT_FALLBACK;
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--color-ink-red')
    .trim();
  return value || ACCENT_FALLBACK;
}

type DieRoll = { sides: number; value: number };

function flattenRolls(results: unknown): DieRoll[] {
  if (!Array.isArray(results)) return [];
  const out: DieRoll[] = [];
  for (const group of results) {
    if (!group || typeof group !== 'object') continue;
    const candidate = group as { rolls?: unknown; value?: unknown; sides?: unknown };
    if (Array.isArray(candidate.rolls)) {
      for (const die of candidate.rolls) {
        if (!die || typeof die !== 'object') continue;
        const d = die as { sides?: unknown; value?: unknown };
        const sides = Number(d.sides);
        const value = Number(d.value);
        if (Number.isFinite(sides) && Number.isFinite(value)) {
          out.push({ sides, value });
        }
      }
    } else if (candidate.value !== undefined && candidate.sides !== undefined) {
      const sides = Number(candidate.sides);
      const value = Number(candidate.value);
      if (Number.isFinite(sides) && Number.isFinite(value)) {
        out.push({ sides, value });
      }
    }
  }
  return out;
}

function splitRolls(rolls: DieRoll[]): StageRollResult {
  let featRaw = 0;
  const successFaces: number[] = [];
  for (const roll of rolls) {
    if (roll.sides === 12 && featRaw === 0) {
      featRaw = roll.value;
    } else if (roll.sides === 6) {
      successFaces.push(roll.value);
    }
  }
  return { featRaw, successFaces };
}

export function DiceStage() {
  const reducedMotion = usePrefersReducedMotion();
  const boxRef = useRef<DiceBox | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef(false);
  const initialisedRef = useRef(false);
  const themeObserverRef = useRef<MutationObserver | null>(null);
  const pendingRef = useRef<{
    resolve: (value: StageRollResult) => void;
    reject: (reason: Error) => void;
  } | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (typeof document === 'undefined') return;

    const overlay = document.createElement('div');
    overlay.id = CONTAINER_ID;
    overlay.dataset.dice = 'ui';
    overlay.className =
      'no-print pointer-events-none fixed inset-0 z-[60] opacity-0 transition-opacity duration-300';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    let cancelled = false;
    let resizeTimer: number | null = null;

    const showOverlay = () => {
      overlay.classList.remove('opacity-0');
      overlay.classList.add('opacity-100');
    };
    const hideOverlay = () => {
      overlay.classList.add('opacity-0');
      overlay.classList.remove('opacity-100');
    };

    const syncCanvasDimensions = () => {
      const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
      if (!overlay || !canvas) return;
      const width = overlay.clientWidth;
      const height = overlay.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const bufferWidth = Math.min(Math.floor(width * dpr), MAX_CANVAS_DIMENSION);
      const bufferHeight = Math.min(Math.floor(height * dpr), MAX_CANVAS_DIMENSION);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (!initialisedRef.current) {
        // Pre-init: write the backing buffer directly so DiceBox picks the
        // right dimensions when it transfers the canvas to its worker.
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      } else if (boxRef.current && typeof boxRef.current.resizeWorld === 'function') {
        boxRef.current.resizeWorld();
      }
    };

    const handleResize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(syncCanvasDimensions, RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener('resize', handleResize);

    async function init() {
      try {
        const { default: DiceBoxCtor } = await import('@3d-dice/dice-box');
        if (cancelled) return;
        const box = new DiceBoxCtor({
          assetPath: ASSET_PATH,
          container: `#${CONTAINER_ID}`,
          id: CANVAS_ID,
          theme: 'default',
          themeColor: readAccentColour(),
          scale: 7,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        });

        // Set the canvas backing buffer before init so the worker sees full
        // viewport resolution from the start.
        syncCanvasDimensions();

        await box.init();
        if (cancelled) {
          box.clear();
          return;
        }
        boxRef.current = box;
        initialisedRef.current = true;
        readyRef.current = true;

        // After init the canvas is owned by the worker; resize through the box.
        syncCanvasDimensions();

        // Mirror the active theme's accent colour onto the dice. The token
        // value is read from CSS so future theme additions are picked up.
        let lastAccent = readAccentColour();
        const themeObserver = new MutationObserver(() => {
          const next = readAccentColour();
          if (next === lastAccent) return;
          lastAccent = next;
          void box.updateConfig({ themeColor: next });
        });
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        });
        themeObserverRef.current = themeObserver;

        box.onRollComplete = (results: unknown) => {
          const rolls = flattenRolls(results);
          const split = splitRolls(rolls);
          hideOverlay();
          if (pendingRef.current) {
            pendingRef.current.resolve(split);
            pendingRef.current = null;
          }
          window.setTimeout(() => {
            if (boxRef.current === box) box.clear();
          }, 320);
        };

        registerStage({
          isReady: () => readyRef.current,
          roll: (featCount, successCount) => {
            if (!readyRef.current || !boxRef.current) {
              return Promise.reject(new Error('Dice stage not ready'));
            }
            if (pendingRef.current) {
              return Promise.reject(new Error('A roll is already in progress'));
            }
            return new Promise<StageRollResult>((resolve, reject) => {
              pendingRef.current = { resolve, reject };
              showOverlay();
              const notation: string[] = [];
              if (featCount > 0) notation.push(`${featCount}d12`);
              if (successCount > 0) notation.push(`${successCount}d6`);
              try {
                void boxRef.current!.roll(notation);
              } catch (error) {
                hideOverlay();
                pendingRef.current = null;
                reject(error instanceof Error ? error : new Error('Dice roll failed'));
              }
            });
          },
        });
      } catch (error) {
        if (!cancelled) {
          console.error('DiceStage init failed', error);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
      readyRef.current = false;
      initialisedRef.current = false;
      registerStage(null);
      window.removeEventListener('resize', handleResize);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      if (themeObserverRef.current) {
        themeObserverRef.current.disconnect();
        themeObserverRef.current = null;
      }
      if (boxRef.current) {
        boxRef.current.clear();
        boxRef.current = null;
      }
      if (pendingRef.current) {
        pendingRef.current.reject(new Error('Dice stage unmounted'));
        pendingRef.current = null;
      }
      if (overlayRef.current?.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
      }
      overlayRef.current = null;
    };
  }, [reducedMotion]);

  return null;
}
