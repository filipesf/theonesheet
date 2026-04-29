import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { RenameCharacterDialog } from '../RenameCharacterDialog';

describe('RenameCharacterDialog', () => {
  it('submits the trimmed value via onConfirm', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RenameCharacterDialog
        open
        onOpenChange={onOpenChange}
        currentName="Frodo"
        onConfirm={onConfirm}
      />,
    );

    const input = screen.getByDisplayValue('Frodo');
    await user.clear(input);
    await user.type(input, '  Bilbo  ');
    await user.click(screen.getByRole('button', { name: /renomear/i }));

    expect(onConfirm).toHaveBeenCalledWith('Bilbo');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps the submit button disabled when the name is empty', async () => {
    const user = userEvent.setup();
    render(
      <RenameCharacterDialog
        open
        onOpenChange={() => {}}
        currentName=""
        onConfirm={() => {}}
      />,
    );

    const submit = screen.getByRole('button', { name: /renomear/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByRole('textbox'), 'Sam');
    expect(submit).not.toBeDisabled();
  });
});
