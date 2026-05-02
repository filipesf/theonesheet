import { describe, expect, it } from 'vitest';
import { HEROIC_CULTURES } from '../../domain/types';
import {
  CANONICAL_DISTINCTIVE_FEATURES,
  CULTURAL_DISTINCTIVE_FEATURES,
  CALLING_DISTINCTIVE_FEATURES,
  deprecatedDistinctiveFeatureCanonical,
  findCultureForFeature,
  isCallingDistinctiveFeatureId,
  isCulturalDistinctiveFeatureId,
  isKnownDistinctiveFeatureId,
  legacyNameToDistinctiveFeatureId,
} from '../distinctive-features';

describe('CULTURAL_DISTINCTIVE_FEATURES', () => {
  it('exposes 24 canonical cultural features (DOMAIN_SPEC §6.6)', () => {
    expect(CANONICAL_DISTINCTIVE_FEATURES).toHaveLength(24);
    expect(new Set(CANONICAL_DISTINCTIVE_FEATURES).size).toBe(24);
  });

  it('has eight features per culture (DOMAIN_SPEC §6.5)', () => {
    for (const culture of HEROIC_CULTURES) {
      expect(CULTURAL_DISTINCTIVE_FEATURES[culture]).toHaveLength(8);
    }
  });

  it('every per-culture id is one of the canonical 24', () => {
    const canonical = new Set<string>(CANONICAL_DISTINCTIVE_FEATURES);
    for (const ids of Object.values(CULTURAL_DISTINCTIVE_FEATURES)) {
      for (const id of ids) {
        expect(canonical.has(id)).toBe(true);
      }
    }
  });

  it('every id is kebab-case', () => {
    for (const ids of Object.values(CULTURAL_DISTINCTIVE_FEATURES)) {
      for (const id of ids) {
        expect(id).toMatch(/^[a-z][a-z-]*$/);
      }
    }
  });

  it('isCallingDistinctiveFeatureId distinguishes the six calling features', () => {
    for (const id of CALLING_DISTINCTIVE_FEATURES) {
      expect(isCallingDistinctiveFeatureId(id)).toBe(true);
    }
    expect(isCallingDistinctiveFeatureId('cunning')).toBe(false);
  });

  it('isCulturalDistinctiveFeatureId tracks the canonical pool only', () => {
    expect(isCulturalDistinctiveFeatureId('cunning')).toBe(true);
    expect(isCulturalDistinctiveFeatureId('grim')).toBe(false); // pre-Phase-3
    expect(isCulturalDistinctiveFeatureId('burglary')).toBe(false);
  });

  it('isKnownDistinctiveFeatureId accepts both pools', () => {
    expect(isKnownDistinctiveFeatureId('keen-eyed')).toBe(true);
    expect(isKnownDistinctiveFeatureId('burglary')).toBe(true);
    expect(isKnownDistinctiveFeatureId('completely-made-up')).toBe(false);
  });

  it('findCultureForFeature returns a culture for cultural ids and null for calling ids', () => {
    expect(findCultureForFeature('keen-eyed')).not.toBeNull();
    expect(findCultureForFeature('burglary')).toBeNull();
    expect(findCultureForFeature('does-not-exist')).toBeNull();
  });

  it('legacy English names map to canonical kebab ids', () => {
    expect(legacyNameToDistinctiveFeatureId('Keen-Eyed')).toBe('keen-eyed');
    expect(legacyNameToDistinctiveFeatureId('Burglary')).toBe('burglary');
    expect(legacyNameToDistinctiveFeatureId('Unknown')).toBeNull();
  });

  it('deprecated pre-Phase-3 ids map to their closest canonical neighbour', () => {
    expect(deprecatedDistinctiveFeatureCanonical('grim')).toBe('stern');
    expect(deprecatedDistinctiveFeatureCanonical('curious')).toBe('inquisitive');
    expect(deprecatedDistinctiveFeatureCanonical('vigilant')).toBe('wary');
    expect(deprecatedDistinctiveFeatureCanonical('cunning')).toBeNull(); // already canonical
  });
});
