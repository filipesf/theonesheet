import { normaliseCharacter } from '../normalise';
import type { Character } from '../types';

export function migrateV0ToV0(character: Character): Character {
  return normaliseCharacter(character);
}
