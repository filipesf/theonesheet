import { migrateV0ToV0 } from '../../domain/migrations/v0';
import { createEmptyCharacter } from '../../domain/schema';
import type {
  ArmourId,
  Character,
  RewardId,
  ShieldId,
  VirtueId,
  WeaponId,
} from '../../domain/types';
import { CALLINGS_DATA } from '../../ref-data/callings';
import { CULTURES } from '../../ref-data/cultures';
import type { CreationDraft } from './creationSchema';

export function draftToCharacter(draft: CreationDraft): Character {
  const seed = createEmptyCharacter(draft.heroic_culture);
  const culture = CULTURES[draft.heroic_culture];
  const calling = CALLINGS_DATA[draft.calling];

  const character: Character = {
    ...seed,
    name: draft.name.trim(),
    age: draft.age,
    cultural_blessing: culture.blessingId,
    standard_of_living: draft.standard_of_living,
    calling: draft.calling,
    shadow_path: calling.shadowPath,
    attributes: {
      ...seed.attributes,
      strength: draft.strength,
      heart: draft.heart,
      wits: draft.wits,
    },
    skills: draft.skills.map((entry) => {
      const original = seed.skills.find((s) => (entry.id ? s.id === entry.id : s.name === entry.name));
      return {
        ...(original?.id ? { id: original.id } : {}),
        name: entry.name,
        category: original?.category ?? 'STRENGTH',
        rating: entry.rating,
        favoured: entry.favoured,
      };
    }),
    combat_proficiencies: draft.combat_proficiencies.map((entry) => ({
      name: entry.name,
      rating: entry.rating,
    })),
    distinctive_features: [...draft.cultural_features, draft.calling_feature],
    rewards: [
      { id: draft.starting_reward as RewardId, name: draft.starting_reward, origin: 'STARTING' },
    ],
    virtues: [
      { id: draft.starting_virtue as VirtueId, name: draft.starting_virtue, origin: 'STARTING' },
    ],
    war_gear: {
      weapons: draft.weapons.map((w) => ({ id: w.id as WeaponId, type: w.id, load: w.load })),
      armour: draft.armour
        ? { id: draft.armour.id as ArmourId, type: draft.armour.id, load: draft.armour.load }
        : null,
      helm: null,
      shield: draft.shield
        ? {
            id: draft.shield.id as ShieldId,
            type: draft.shield.id,
            load: draft.shield.load,
            parry_bonus: draft.shield.parry_bonus,
            destroyed: false,
          }
        : null,
    },
    valour: 1,
    wisdom: 1,
  };

  const migrated = migrateV0ToV0(character);
  return {
    ...migrated,
    current_endurance: migrated.max_endurance,
    current_hope: migrated.max_hope,
  };
}
