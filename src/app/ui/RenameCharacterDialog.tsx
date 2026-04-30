import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Modal } from './Modal';
import { GhostButton, PrimaryButton } from './dialog-buttons';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onConfirm: (name: string) => void;
};

type FormValues = { name: string };

export function RenameCharacterDialog({ open, onOpenChange, currentName, onConfirm }: Props) {
  const { t } = useTranslation();

  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('dialog.rename.error-required') })
      .max(80, { message: t('dialog.rename.error-too-long') }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName },
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) reset({ name: currentName });
  }, [open, currentName, reset]);

  const onSubmit = (values: FormValues) => {
    onConfirm(values.name.trim());
    onOpenChange(false);
  };

  const close = () => onOpenChange(false);

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('dialog.rename.title')}
      footer={
        <>
          <GhostButton onClick={close}>{t('dialog.common.cancel')}</GhostButton>
          <PrimaryButton
            type="submit"
            form="rename-character-form"
            disabled={!isValid}
          >
            {t('dialog.rename.submit')}
          </PrimaryButton>
        </>
      }
    >
      <form
        id="rename-character-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <label className="flex flex-col gap-1">
          <span className="font-label text-microlabel tracking-label uppercase text-ink-red">
            {t('dialog.rename.label')}
          </span>
          <input
            {...register('name')}
            className="bg-transparent border-0 border-b border-ink-red/60 outline-none font-body italic font-semibold text-xl text-ink-navy py-1 focus:border-ink-red transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {errors.name && (
          <p role="alert" className="font-body text-sm text-ink-red">
            {errors.name.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
