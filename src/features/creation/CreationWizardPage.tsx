import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { validateCreation } from '../../domain/creation';
import { createEmptySkills } from '../../ref-data/skills';
import { createEmptyCombatProficiencies } from '../../ref-data/proficiencies';
import { CULTURES } from '../../ref-data/cultures';
import { navigate } from '../../app/router';
import type { Character } from '../../domain/types';
import { WizardFooter } from './components/WizardFooter';
import { WizardShell } from './components/WizardShell';
import {
  STEP_FIELDS,
  STEP_ORDER,
  creationSchema,
  type CreationDraft,
  type StepName,
} from './creationSchema';
import { draftToCharacter } from './draftToCharacter';
import { StepAttributes } from './steps/StepAttributes';
import { StepCalling } from './steps/StepCalling';
import { StepCulture } from './steps/StepCulture';
import { StepDistinctiveFeatures } from './steps/StepDistinctiveFeatures';
import { StepIdentity } from './steps/StepIdentity';
import { StepProficiencies } from './steps/StepProficiencies';
import { StepReview } from './steps/StepReview';
import { StepSkills } from './steps/StepSkills';

type Props = {
  onCreate: (character: Character) => string;
};

const DEFAULT_VALUES: CreationDraft = {
  heroic_culture: 'HOBBITS_OF_THE_SHIRE',
  attribute_set_index: 0,
  strength: 4,
  heart: 6,
  wits: 6,
  skills: createEmptySkills().map((s) => ({ name: s.name, rating: s.rating, favoured: s.favoured })),
  combat_proficiencies: createEmptyCombatProficiencies().map((p) => ({ name: p.name, rating: p.rating })),
  cultural_features: [],
  name: '',
  age: 30,
  calling: 'TREASURE_HUNTER',
  calling_feature: '',
  starting_reward: '',
  starting_virtue: '',
  standard_of_living: CULTURES.HOBBITS_OF_THE_SHIRE.standardOfLiving,
  weapons: [],
  armour: null,
  shield: null,
};

export function CreationWizardPage({ onCreate }: Props) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const methods = useForm<CreationDraft>({
    resolver: zodResolver(creationSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const currentStep: StepName = STEP_ORDER[stepIndex]!;
  const isFirst = stepIndex === 0;
  const isLast = currentStep === 'review';

  async function handleNext() {
    if (currentStep === 'review') return;
    const fields = STEP_FIELDS[currentStep];
    const ok = await methods.trigger(fields as readonly (keyof CreationDraft)[]);
    if (!ok) return;
    setStepIndex((index) => Math.min(index + 1, STEP_ORDER.length - 1));
  }

  function handleBack() {
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function handleCancel() {
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
      blocking.forEach((issue) => toast.error(`${issue.field}: ${issue.message}`));
      return;
    }
    const id = onCreate(character);
    toast.success(t('creation.wizard.created-toast'));
    navigate({ name: 'characterEditor', id });
  }

  const canAdvance = isLast ? methods.formState.isValid : true;

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

