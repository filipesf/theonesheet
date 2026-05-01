import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildHash, parseHash, redirectLegacyHashIfNeeded } from '../router';

describe('parseHash', () => {
  it('treats empty hash as library', () => {
    expect(parseHash('')).toEqual({ name: 'library' });
    expect(parseHash('#')).toEqual({ name: 'library' });
    expect(parseHash('#/')).toEqual({ name: 'library' });
  });

  it('parses the legacy explicit library hash', () => {
    expect(parseHash('#/library')).toEqual({ name: 'library' });
  });

  it('parses the canonical character/new placeholder', () => {
    expect(parseHash('#/character/new')).toEqual({ name: 'characterNew' });
  });

  it('parses the editor route', () => {
    expect(parseHash('#/character/abc123')).toEqual({
      name: 'characterEditor',
      id: 'abc123',
    });
  });

  it('parses the printed route', () => {
    expect(parseHash('#/character/abc123/sheet')).toEqual({
      name: 'characterPrinted',
      id: 'abc123',
    });
  });

  it('parses the settings route', () => {
    expect(parseHash('#/settings')).toEqual({ name: 'settings' });
  });

  it('parses the legacy sheet hash as printed', () => {
    expect(parseHash('#/sheet/legacy-id')).toEqual({
      name: 'characterPrinted',
      id: 'legacy-id',
    });
  });

  it('decodes percent-encoded ids', () => {
    expect(parseHash('#/character/abc%20def')).toEqual({
      name: 'characterEditor',
      id: 'abc def',
    });
  });

  it('strips trailing slashes and query suffixes', () => {
    expect(parseHash('#/character/abc/')).toEqual({
      name: 'characterEditor',
      id: 'abc',
    });
    expect(parseHash('#/settings?from=tools')).toEqual({ name: 'settings' });
  });

  it('falls back to library on unknown hashes', () => {
    expect(parseHash('#/unknown/path')).toEqual({ name: 'library' });
    expect(parseHash('#/character')).toEqual({ name: 'library' });
  });

  // Stale deep-links into the wizard (e.g. an older build that wrote
  // sub-routes for each step) should resolve to the wizard rather than
  // bouncing the user to the library and discarding their draft.
  it('resolves stale wizard sub-paths to characterNew', () => {
    expect(parseHash('#/character/new/calling')).toEqual({ name: 'characterNew' });
    expect(parseHash('#/character/new/anything/else')).toEqual({ name: 'characterNew' });
  });
});

describe('buildHash', () => {
  it('round-trips every variant', () => {
    expect(buildHash({ name: 'library' })).toBe('#/');
    expect(buildHash({ name: 'characterNew' })).toBe('#/character/new');
    expect(buildHash({ name: 'characterEditor', id: 'abc' })).toBe('#/character/abc');
    expect(buildHash({ name: 'characterPrinted', id: 'abc' })).toBe('#/character/abc/sheet');
    expect(buildHash({ name: 'settings' })).toBe('#/settings');
  });

  it('encodes special characters in ids', () => {
    expect(buildHash({ name: 'characterEditor', id: 'a/b' })).toBe('#/character/a%2Fb');
  });
});

describe('redirectLegacyHashIfNeeded', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('rewrites #/library to #/', () => {
    window.history.replaceState(null, '', '#/library');
    redirectLegacyHashIfNeeded();
    expect(window.location.hash).toBe('#/');
  });

  it('rewrites #/sheet/:id to #/character/:id/sheet', () => {
    window.history.replaceState(null, '', '#/sheet/foo');
    redirectLegacyHashIfNeeded();
    expect(window.location.hash).toBe('#/character/foo/sheet');
  });

  it('leaves canonical hashes untouched', () => {
    window.history.replaceState(null, '', '#/character/foo/sheet');
    redirectLegacyHashIfNeeded();
    expect(window.location.hash).toBe('#/character/foo/sheet');
  });

  it('rewrites stale wizard sub-paths to #/character/new', () => {
    window.history.replaceState(null, '', '#/character/new/calling');
    redirectLegacyHashIfNeeded();
    expect(window.location.hash).toBe('#/character/new');
  });
});
