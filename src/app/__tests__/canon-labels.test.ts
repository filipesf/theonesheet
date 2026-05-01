import { beforeAll, describe, expect, it } from 'vitest';
import { i18n } from '../i18n';

describe('canon labels (Devir pt-BR)', () => {
  beforeAll(async () => {
    if (!i18n.isInitialized) {
      await new Promise<void>((resolve) => {
        i18n.on('initialized', () => resolve());
      });
    }
  });

  it('uses Astúcia for the wits attribute', () => {
    expect(i18n.t('sheet.attribute.wits')).toBe('Astúcia');
  });

  it('uses Resistência for the endurance derived stat', () => {
    expect(i18n.t('sheet.label.derived.endurance')).toBe('Resistência');
  });

  it('uses Chamado for the calling field', () => {
    expect(i18n.t('sheet.label.calling')).toBe('Chamado');
  });

  it('uses Bloqueio for the parry derived stat', () => {
    expect(i18n.t('sheet.label.derived.parry')).toBe('Bloqueio');
  });

  it('uses NA for the target-number sub-label', () => {
    expect(i18n.t('sheet.label.tn')).toBe('NA');
  });

  it('uses Exausto and Arrasado for weary and miserable conditions', () => {
    expect(i18n.t('sheet.condition.weary')).toBe('Exausto');
    expect(i18n.t('sheet.condition.miserable')).toBe('Arrasado');
  });

  it('uses Características Notáveis for distinctive features', () => {
    expect(i18n.t('sheet.label.distinctive-features')).toBe('Características Notáveis');
  });

  it('uses the canonical pt-BR skill names (the nine renamed)', () => {
    expect(i18n.t('ref.skills.awe')).toBe('Fascínio');
    expect(i18n.t('ref.skills.awareness')).toBe('Vigilância');
    expect(i18n.t('ref.skills.hunting')).toBe('Caçada');
    expect(i18n.t('ref.skills.song')).toBe('Música');
    expect(i18n.t('ref.skills.enhearten')).toBe('Indução');
    expect(i18n.t('ref.skills.scan')).toBe('Busca');
    expect(i18n.t('ref.skills.explore')).toBe('Exploração');
    expect(i18n.t('ref.skills.riddle')).toBe('Enigma');
    expect(i18n.t('ref.skills.lore')).toBe('História');
  });
});
