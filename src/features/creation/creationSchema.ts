import { z } from 'zod';
import { CALLINGS, HEROIC_CULTURES, STANDARD_OF_LIVING } from '../../domain/types';

export const cultureStep = z.object({
  heroic_culture: z.enum(HEROIC_CULTURES),
});

export const attributesStep = z.object({
  attribute_set_index: z.number().int().min(0).max(5),
  strength: z.number().int().min(2).max(7),
  heart: z.number().int().min(2).max(7),
  wits: z.number().int().min(2).max(7),
});

const skillEntry = z.object({
  id: z.string().optional(),
  name: z.string(),
  rating: z.number().int().min(0).max(6),
  favoured: z.boolean(),
});

export const skillsStep = z.object({
  skills: z.array(skillEntry).length(18),
});

const proficiencyEntry = z.object({
  name: z.enum(['AXES', 'BOWS', 'SPEARS', 'SWORDS']),
  rating: z.number().int().min(0).max(6),
});

export const proficienciesStep = z.object({
  combat_proficiencies: z.array(proficiencyEntry).length(4),
});

export const distinctiveFeaturesStep = z.object({
  cultural_features: z.array(z.string().min(1)).length(2),
});

export const identityStep = z.object({
  name: z.string().trim().min(1).max(80),
  age: z.number().int().min(8).max(400),
});

const weaponEntry = z.object({
  id: z.string().min(1),
  load: z.number().int().min(0),
});

const armourEntry = z.object({
  id: z.string().min(1),
  load: z.number().int().min(0),
});

const shieldEntry = z.object({
  id: z.string().min(1),
  load: z.number().int().min(0),
  parry_bonus: z.number().int(),
});

export const callingStep = z.object({
  calling: z.enum(CALLINGS),
  calling_feature: z.string().min(1),
  starting_reward: z.string().min(1),
  starting_virtue: z.string().min(1),
  standard_of_living: z.enum(STANDARD_OF_LIVING),
  weapons: z.array(weaponEntry).max(4),
  armour: armourEntry.nullable(),
  shield: shieldEntry.nullable(),
});

export const creationSchema = cultureStep
  .merge(attributesStep)
  .merge(skillsStep)
  .merge(proficienciesStep)
  .merge(distinctiveFeaturesStep)
  .merge(identityStep)
  .merge(callingStep);

export type CreationDraft = z.infer<typeof creationSchema>;

export const STEP_FIELDS = {
  culture: ['heroic_culture'] as const,
  attributes: ['attribute_set_index', 'strength', 'heart', 'wits'] as const,
  skills: ['skills'] as const,
  proficiencies: ['combat_proficiencies'] as const,
  features: ['cultural_features'] as const,
  identity: ['name', 'age'] as const,
  calling: [
    'calling',
    'calling_feature',
    'starting_reward',
    'starting_virtue',
    'standard_of_living',
    'weapons',
    'armour',
    'shield',
  ] as const,
} satisfies Record<string, readonly (keyof CreationDraft)[]>;

export type StepName = keyof typeof STEP_FIELDS | 'review';

export const STEP_ORDER: StepName[] = [
  'culture',
  'attributes',
  'skills',
  'proficiencies',
  'features',
  'identity',
  'calling',
  'review',
];
