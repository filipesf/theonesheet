import { normaliseCharacter } from '../../domain/normalise';
import { createEmptyCharacter } from '../../domain/schema';
import type { Character } from '../../domain/types';
import { CULTURES } from '../../ref-data/cultures';
import { CALLINGS_DATA } from './content/callings';
import type { CreationDraft } from './creationSchema';

export function draftToCharacter(draft: CreationDraft): Character {
  const seed = createEmptyCharacter(draft.heroic_culture);
  const culture = CULTURES[draft.heroic_culture];
  const calling = CALLINGS_DATA[draft.calling];

  const character: Character = {
    ...seed,
    name: draft.name.trim(),
    age: draft.age,
    cultural_blessing: culture.blessing,
    standard_of_living: draft.standard_of_living,
    calling: draft.calling,
    shadow_path: calling.shadow_path,
    attributes: {
      ...seed.attributes,
      strength: draft.strength,
      heart: draft.heart,
      wits: draft.wits,
    },
    skills: draft.skills.map((entry) => {
      const original = seed.skills.find((s) => s.name === entry.name);
      return {
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
    rewards: [{ name: draft.starting_reward, origin: 'STARTING' }],
    virtues: [{ name: draft.starting_virtue, origin: 'STARTING' }],
    war_gear: {
      weapons: draft.weapons.map((w) => ({ ...w })),
      armour: draft.armour ? { ...draft.armour } : null,
      helm: null,
      shield: draft.shield
        ? { ...draft.shield, destroyed: false }
        : null,
    },
    valour: 1,
    wisdom: 1,
  };

  const normalised = normaliseCharacter(character);
  return {
    ...normalised,
    current_endurance: normalised.max_endurance,
    current_hope: normalised.max_hope,
  };
}
