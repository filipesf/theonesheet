import { beforeAll, describe, expect, it } from 'vitest';
import { i18n } from '../i18n';

describe('i18n bundle', () => {
  beforeAll(async () => {
    if (!i18n.isInitialized) {
      await new Promise<void>((resolve) => {
        i18n.on('initialized', () => resolve());
      });
    }
  });

  it('initialises with pt-BR as the active language', () => {
    expect(i18n.language.startsWith('pt-BR')).toBe(true);
  });

  it('resolves at least one known key', () => {
    expect(i18n.t('library.heading')).toBe('Sua Companhia');
  });

  it('handles plural forms for the library subheading', () => {
    const one = i18n.t('library.subheading-count', { count: 1 });
    const many = i18n.t('library.subheading-count', { count: 3 });
    expect(one).toContain('herói');
    expect(many).toContain('heróis');
  });
});
