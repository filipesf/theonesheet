import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { validateCreation } from '../../domain/creation';
import { createEmptySkills } from '../../ref-data/skills';
import { createEmptyCombatProficiencies } from '../../ref-data/proficiencies';
import { navigate } from '../../app/router';
import type { Calling, Character, HeroicCulture, StandardOfLiving } from '../../domain/types';
import { WizardFooter } from './components/WizardFooter';
import { WizardShell } from './components/WizardShell';
import {
  STEP_FIELDS,
  STEP_ORDER,
  creationSchema,
  type CreationDraft,
  type StepName,
} from './creationSchema';
import { clearDraft, loadDraft, saveDraft } from './draftPersistence';
import { draftToCharacter } from './draftToCharacter';
import { StepAttributes } from './steps/StepAttributes';
import { StepCalling } from './steps/StepCalling';
import { StepCompany } from './steps/StepCompany';
import { StepCulture } from './steps/StepCulture';
import { StepDistinctiveFeatures } from './steps/StepDistinctiveFeatures';
import { StepIdentity } from './steps/StepIdentity';
import { StepProficiencies } from './steps/StepProficiencies';
import { StepReview } from './steps/StepReview';
import { StepSkills } from './steps/StepSkills';

type Props = {
  onCreate: (character: Character) => string;
};

// Defaults are intentionally "blank" for the irreversible choices (culture,
// attributes, calling, SoL): the wizard requires explicit user picks. The
// `as unknown as` casts preserve the strict zod schema; `mode: 'onTouched'`
// keeps the errors silent until interaction.
const DEFAULT_VALUES: CreationDraft = {
  heroic_culture: undefined as unknown as HeroicCulture,
  cultural_blessing_choice: null,
  underlined_skill_pick: null,
  attribute_set_index: -1,
  strength: 0,
  heart: 0,
  wits: 0,
  skills: createEmptySkills().map((s) => ({ id: s.id, name: s.name, rating: s.rating, favoured: s.favoured })),
  combat_proficiencies: createEmptyCombatProficiencies().map((p) => ({ name: p.name, rating: p.rating })),
  cultural_features: [],
  name: '',
  age: 30,
  calling: undefined as unknown as Calling,
  calling_feature: '',
  starting_reward: '',
  starting_virtue: '',
  starting_virtue_selection: null,
  standard_of_living: undefined as unknown as StandardOfLiving,
  weapons: [],
  armour: null,
  shield: null,
  patron_id: '',
  safe_haven: '',
};

export function CreationWizardPage({ onCreate }: Props) {
  const { t } = useTranslation();
  // Resolve any persisted draft synchronously, before useForm/useState see
  // their defaults. Reading once on the first render avoids late hydration
  // (react-hook-form snapshots defaultValues at mount).
  const initialDraftRef = useRef(loadDraft());
  const initialDraft = initialDraftRef.current;
  const [stepIndex, setStepIndex] = useState(initialDraft?.stepIndex ?? 0);
  const methods = useForm<CreationDraft>({
    resolver: zodResolver(creationSchema),
    defaultValues: initialDraft?.draft ?? DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const currentStep: StepName = STEP_ORDER[stepIndex]!;
  const isFirst = stepIndex === 0;
  const isLast = currentStep === 'review';

  async function handleNext() {
    if (currentStep === 'review') return;
    const fields = STEP_FIELDS[currentStep];
    const ok = await methods.trigger(fields as readonly (keyof CreationDraft)[]);
    if (!ok) {
      toast.error(t('creation.advance-blocked'));
      return;
    }
    setStepIndex((index) => Math.min(index + 1, STEP_ORDER.length - 1));
  }

  function handleBack() {
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function handleCancel() {
    clearDraft();
    navigate({ name: 'library' });
  }

  // Warn on tab close / hard navigation while the form has unsaved progress.
  // Hash-router back is not gated here — Wave 4 may add a popstate confirm.
  useEffect(() => {
    if (!methods.formState.isDirty) return;
    function handler(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [methods.formState.isDirty]);

  // Persist the draft on every change, debounced. We only start writing
  // once the form has been touched so an unloaded fresh wizard doesn't
  // overwrite a previous draft we just chose to ignore (cancel path).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const subscription = methods.watch((value) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!methods.formState.isDirty && !initialDraftRef.current) return;
        saveDraft({ draft: value as CreationDraft, stepIndex });
      }, 300);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [methods, stepIndex]);

  // Snapshot stepIndex changes immediately so a reload between steps
  // restores the user to the right place even if they didn't type
  // anything on the new step yet.
  useEffect(() => {
    if (!methods.formState.isDirty && !initialDraftRef.current) return;
    saveDraft({ draft: methods.getValues(), stepIndex });
  }, [methods, stepIndex]);

  async function handleFinalise() {
    const ok = await methods.trigger();
    if (!ok) {
      toast.error(t('creation.wizard.invalid-toast'));
      return;
    }
    const draft = methods.getValues();
    const character = draftToCharacter(draft);
    const blocking = validateCreation(character).filter((i) => i.blocking);
    if (blocking.length > 0) {
      blocking.forEach((issue) => {
        const fieldLabel = t(`creation.field.${issue.field}`, { defaultValue: issue.field });
        const message = t(`creation.issue.${issue.code}`, issue.data ?? {});
        toast.error(`${fieldLabel}: ${message}`);
      });
      return;
    }
    const id = onCreate(character);
    clearDraft();
    toast.success(t('creation.wizard.created-toast'));
    navigate({ name: 'characterEditor', id });
  }

  const stepErrors = STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS] ?? [];
  const stepHasError = stepErrors.some((field) => methods.formState.errors[field] !== undefined);
  const canAdvance = isLast ? methods.formState.isValid : !stepHasError;

  return (
    <FormProvider {...methods}>
      <WizardShell currentStep={currentStep}>
        {currentStep === 'culture' && <StepCulture />}
        {currentStep === 'attributes' && <StepAttributes />}
        {currentStep === 'skills' && <StepSkills />}
        {currentStep === 'proficiencies' && <StepProficiencies />}
        {currentStep === 'features' && <StepDistinctiveFeatures />}
        {currentStep === 'identity' && <StepIdentity />}
        {currentStep === 'calling' && <StepCalling />}
        {currentStep === 'company' && <StepCompany />}
        {currentStep === 'review' && <StepReview />}

        <WizardFooter
          isFirst={isFirst}
          isLast={isLast}
          canAdvance={canAdvance}
          onBack={handleBack}
          onNext={handleNext}
          onCancel={handleCancel}
          onFinalise={handleFinalise}
        />
      </WizardShell>
    </FormProvider>
  );
}

