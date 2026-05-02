import { z } from 'zod';
import { CALLINGS, HEROIC_CULTURES, STANDARD_OF_LIVING } from '../../domain/types';
import { CALLINGS_DATA } from '../../ref-data/callings';
import { CULTURAL_UNDERLINED_SKILLS } from '../../ref-data/cultural-skills';
import { PATRON_IDS } from '../../ref-data/patrons';
import { SKILLS, type SkillId } from '../../ref-data/skills';

const SKILL_IDS = SKILLS.map((skill) => skill.id) as [SkillId, ...SkillId[]];

export const culturalBlessingChoiceSchema = z
  .object({
    kind: z.literal('attribute-plus'),
    attribute: z.enum(['strength', 'heart', 'wits']),
  })
  .nullable();

export const cultureStep = z.object({
  heroic_culture: z.enum(HEROIC_CULTURES),
  cultural_blessing_choice: culturalBlessingChoiceSchema,
  underlined_skill_pick: z.enum(SKILL_IDS).nullable(),
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

const masterySelection = z
  .object({
    kind: z.literal('mastery'),
    skill_ids: z.array(z.enum(SKILL_IDS)).length(2),
  })
  .refine((value) => value.skill_ids[0] !== value.skill_ids[1], {
    message: 'mastery-skills-distinct',
    path: ['skill_ids'],
  });

const prowessSelection = z.object({
  kind: z.literal('prowess'),
  attribute: z.enum(['strength', 'heart', 'wits']),
});

export const virtueSelectionSchema = z
  .union([masterySelection, prowessSelection])
  .nullable();

const callingStepShape = z.object({
  calling: z.enum(CALLINGS),
  calling_feature: z.string().min(1),
  starting_reward: z.string().min(1),
  starting_virtue: z.string().min(1),
  starting_virtue_selection: virtueSelectionSchema,
  standard_of_living: z.enum(STANDARD_OF_LIVING),
  weapons: z.array(weaponEntry).max(4),
  armour: armourEntry.nullable(),
  shield: shieldEntry.nullable(),
});

export const companyStep = z.object({
  // Optional in v0 (the player may finalise solo and add a Patron later).
  // Stored as `'' | PatronId`; use `''` to mean "no patron yet".
  patron_id: z.union([z.enum(PATRON_IDS), z.literal('')]),
  safe_haven: z.string().trim().max(80),
});

function refineVirtueSelection<T extends z.ZodTypeAny>(schema: T): T {
  return schema.superRefine((data, ctx) => {
    const draft = data as Partial<{
      heroic_culture: (typeof HEROIC_CULTURES)[number];
      starting_virtue: string;
      starting_virtue_selection: z.infer<typeof virtueSelectionSchema>;
      cultural_blessing_choice: z.infer<typeof culturalBlessingChoiceSchema>;
      underlined_skill_pick: string | null;
    }>;
    if (draft.starting_virtue === 'mastery') {
      if (draft.starting_virtue_selection?.kind !== 'mastery') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['starting_virtue_selection'],
          message: 'mastery-selection-required',
        });
      }
    }
    if (draft.starting_virtue === 'prowess') {
      if (draft.starting_virtue_selection?.kind !== 'prowess') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['starting_virtue_selection'],
          message: 'prowess-selection-required',
        });
      }
    }
    if (draft.heroic_culture === 'RANGERS_OF_THE_NORTH') {
      if (draft.cultural_blessing_choice?.kind !== 'attribute-plus') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cultural_blessing_choice'],
          message: 'rangers-attribute-choice-required',
        });
      }
    }
    if (draft.heroic_culture) {
      const pair = CULTURAL_UNDERLINED_SKILLS[draft.heroic_culture];
      const pick = draft.underlined_skill_pick;
      if (!pick || !pair.includes(pick as (typeof pair)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['underlined_skill_pick'],
          message: 'underlined-skill-required',
        });
      }
    }
    // Phase 3.11 (8b): the player must pick exactly 2 of the calling's
    // 3 listed skills as Favoured. Validate after the calling has been
    // selected; the per-skill `favoured` flags are toggled in StepCalling.
    const fullDraft = data as Partial<{
      calling: (typeof CALLINGS)[number];
      skills: ReadonlyArray<{ id?: string; favoured: boolean }>;
    }>;
    if (fullDraft.calling && fullDraft.skills) {
      const callingSkills: readonly string[] =
        CALLINGS_DATA[fullDraft.calling].favouredSkillIds;
      const favouredFromCalling = fullDraft.skills.filter(
        (skill) => !!skill.id && callingSkills.includes(skill.id) && skill.favoured,
      );
      if (favouredFromCalling.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['calling_favoured_skills'],
          message: 'calling-favoured-skills-pick-two',
        });
      }
    }
  }) as unknown as T;
}

export const callingStep = refineVirtueSelection(callingStepShape);

export const creationSchema = refineVirtueSelection(
  cultureStep
    .merge(attributesStep)
    .merge(skillsStep)
    .merge(proficienciesStep)
    .merge(distinctiveFeaturesStep)
    .merge(identityStep)
    .merge(callingStepShape)
    .merge(companyStep),
);

export type CreationDraft = z.infer<typeof creationSchema>;

export const STEP_FIELDS = {
  culture: ['heroic_culture', 'cultural_blessing_choice', 'underlined_skill_pick'] as const,
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
    'starting_virtue_selection',
    'standard_of_living',
    'weapons',
    'armour',
    'shield',
  ] as const,
  company: ['patron_id', 'safe_haven'] as const,
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
  'company',
  'review',
];
