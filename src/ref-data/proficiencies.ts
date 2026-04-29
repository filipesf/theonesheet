import type { CombatProficiency } from '../domain/types';

export function createEmptyCombatProficiencies(): CombatProficiency[] {
  return [
    { name: 'AXES', rating: 0 },
    { name: 'BOWS', rating: 0 },
    { name: 'SPEARS', rating: 0 },
    { name: 'SWORDS', rating: 0 },
  ];
}
