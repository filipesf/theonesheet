import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Hidden" />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the title and exposes dialog semantics when open', () => {
    render(
      <Modal open onClose={() => {}} title="Renomear">
        <input aria-label="nome" />
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Renomear')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="X">
        <input aria-label="x" />
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('returns focus to the previously focused element on close', async () => {
    function Harness() {
      return (
        <div>
          <button data-testid="trigger">Open</button>
        </div>
      );
    }
    const { rerender } = render(<Harness />);
    const trigger = screen.getByTestId('trigger');
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerender(
      <>
        <Harness />
        <Modal open onClose={() => {}} title="X">
          <input aria-label="x" />
        </Modal>
      </>,
    );
    // Focus moved into modal.
    expect(document.activeElement).not.toBe(trigger);

    rerender(<Harness />);
    expect(document.activeElement).toBe(trigger);
  });
});
