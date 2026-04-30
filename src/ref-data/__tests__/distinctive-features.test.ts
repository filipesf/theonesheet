import { describe, expect, it } from 'vitest';
import { HEROIC_CULTURES } from '../../domain/types';
import {
  CULTURAL_DISTINCTIVE_FEATURES,
  CALLING_DISTINCTIVE_FEATURES,
  findCultureForFeature,
  isCallingDistinctiveFeatureId,
  isKnownDistinctiveFeatureId,
  legacyNameToDistinctiveFeatureId,
} from '../distinctive-features';

describe('CULTURAL_DISTINCTIVE_FEATURES', () => {
  it('has six features per culture', () => {
    for (const culture of HEROIC_CULTURES) {
      expect(CULTURAL_DISTINCTIVE_FEATURES[culture]).toHaveLength(6);
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
});
