import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'destructive';
  /**
   * Initial focus is the first focusable element by default. Pass a ref
   * to override (e.g. focus the destructive primary action on a delete
   * confirm so Enter immediately commits the choice the user came for).
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'default',
  initialFocusRef,
}: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Capture the trigger when the modal opens; restore focus when it closes
  // (covers both prop change and unmount via the effect cleanup).
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const node = containerRef.current;
    if (node) {
      const focusTarget =
        initialFocusRef?.current ??
        node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
        node;
      focusTarget.focus();
    }
    return () => {
      trigger?.focus();
    };
  }, [open, initialFocusRef]);

  // Lock the body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const node = containerRef.current;
      if (!node) return;
      const focusables = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const accentBorder =
    variant === 'destructive' ? 'border-ink-red' : 'border-ink-red/60';

  return createPortal(
    <div
      role="presentation"
      onMouseDown={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-ink-navy/40 px-4 py-6"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`w-full max-w-lg bg-parchment-soft border-2 ${accentBorder} shadow-[0_8px_40px_-12px_rgba(31,44,92,0.55)] outline-none`}
      >
        <div className="border border-ink-red/40 m-1.5 px-5 py-5 flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <h2
              id={titleId}
              className="font-display text-xl tracking-[0.18em] uppercase text-ink-red"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="font-body text-base text-ink-navy/80">
                {description}
              </p>
            )}
          </header>
          {children && <div className="flex flex-col gap-3">{children}</div>}
          {footer && (
            <footer className="flex flex-wrap justify-end gap-2 pt-2">{footer}</footer>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
