import type { Character } from '../../../domain/types';

export type UpdateCharacter = (partial: Partial<Character>) => void;
