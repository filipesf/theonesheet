import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { ImportCharacterDialog } from '../ImportCharacterDialog';

describe('ImportCharacterDialog', () => {
  it('shows an inline error when the import returns a failure code', async () => {
    const onImport = vi.fn(() => ({ ok: false as const, code: 'invalid-json' as const }));
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ImportCharacterDialog
        open
        onOpenChange={onOpenChange}
        onImport={onImport}
        onSuccess={onSuccess}
      />,
    );

    const textarea = screen.getByRole('textbox');
    await user.click(textarea);
    await user.paste('{not json');
    await user.click(screen.getByRole('button', { name: /importar/i }));

    expect(onImport).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('alert')).toHaveTextContent(/JSON inválido/i);
  });

  it('closes and forwards the new id on success', async () => {
    const onImport = vi.fn(() => ({ ok: true as const, id: 'new-id' }));
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ImportCharacterDialog
        open
        onOpenChange={onOpenChange}
        onImport={onImport}
        onSuccess={onSuccess}
      />,
    );

    const textarea = screen.getByRole('textbox');
    await user.click(textarea);
    await user.paste('{"schemaVersion":"v0"}');
    await user.click(screen.getByRole('button', { name: /importar/i }));

    expect(onSuccess).toHaveBeenCalledWith('new-id');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
