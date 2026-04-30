type Corner = 'tl' | 'tr' | 'bl' | 'br';

const ROTATION: Record<Corner, number> = { tl: 0, tr: 90, br: 180, bl: 270 };

export function CornerOrnament({ corner }: { corner: Corner }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      width="22"
      height="22"
      className="absolute text-ink-red pointer-events-none"
      style={{
        transform: `rotate(${ROTATION[corner]}deg)`,
        top: corner.startsWith('t') ? 6 : 'auto',
        bottom: corner.startsWith('b') ? 6 : 'auto',
        left: corner.endsWith('l') ? 6 : 'auto',
        right: corner.endsWith('r') ? 6 : 'auto',
      }}
    >
      <path
        d="M2 2 L14 2 M2 2 L2 14 M2 2 Q8 8 14 14 M5 5 L9 5 M5 5 L5 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
