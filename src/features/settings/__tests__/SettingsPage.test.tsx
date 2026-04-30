import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../../app/i18n';
import type { ThemeName } from '../../../app/theme/applyTheme';
import { SettingsPage } from '../SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('reports theme picks back to the parent', async () => {
    const onChangeTheme: (theme: ThemeName) => void = vi.fn();
    const user = userEvent.setup();
    render(
      <SettingsPage
        onImport={() => {}}
        onExport={() => {}}
        hasActiveCharacter={false}
        theme="parchment"
        onChangeTheme={onChangeTheme}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Sombras de Mordor/i }));
    expect(onChangeTheme).toHaveBeenCalledWith('tor-dark');
  });

  it('disables the export button when there is no active character', () => {
    render(
      <SettingsPage
        onImport={() => {}}
        onExport={() => {}}
        hasActiveCharacter={false}
        theme="parchment"
        onChangeTheme={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: /Exportar herói ativo/i }),
    ).toBeDisabled();
  });

  it('calls onImport when the import button is clicked', async () => {
    const onImport = vi.fn();
    const user = userEvent.setup();
    render(
      <SettingsPage
        onImport={onImport}
        onExport={() => {}}
        hasActiveCharacter={true}
        theme="parchment"
        onChangeTheme={() => {}}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Importar herói/i }));
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
