import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../app/i18n';
import { SettingsPage } from '../SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('selects the tor-dark theme when its card is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SettingsPage onImport={() => {}} onExport={() => {}} hasActiveCharacter={false} />,
    );

    await user.click(screen.getByRole('button', { name: /Sombras de Mordor/i }));
    expect(document.documentElement.dataset.theme).toBe('tor-dark');
  });

  it('disables the export button when there is no active character', () => {
    render(
      <SettingsPage onImport={() => {}} onExport={() => {}} hasActiveCharacter={false} />,
    );
    expect(
      screen.getByRole('button', { name: /Exportar herói ativo/i }),
    ).toBeDisabled();
  });

  it('calls onImport when the import button is clicked', async () => {
    const onImport = vi.fn();
    const user = userEvent.setup();
    render(
      <SettingsPage onImport={onImport} onExport={() => {}} hasActiveCharacter={true} />,
    );
    await user.click(screen.getByRole('button', { name: /Importar herói/i }));
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
