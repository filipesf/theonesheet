import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { DeleteCharacterDialog } from '../DeleteCharacterDialog';

describe('DeleteCharacterDialog', () => {
  it('calls onConfirm when the destructive button is clicked', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteCharacterDialog
        open
        onOpenChange={onOpenChange}
        characterName="Belba Bolger"
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(/Belba Bolger/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /excluir/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not call onConfirm when cancelled', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteCharacterDialog
        open
        onOpenChange={onOpenChange}
        characterName="Belba Bolger"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
