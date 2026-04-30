import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { ImportErrorCode } from '../../persistence/import';
import { Modal } from './Modal';
import { GhostButton, PrimaryButton } from './dialog-buttons';

type ImportOutcome =
  | { ok: true; id: string }
  | { ok: false; code: ImportErrorCode };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (payload: string) => ImportOutcome;
  onSuccess: (id: string) => void;
};

type FormValues = { payload: string };

export function ImportCharacterDialog({ open, onOpenChange, onImport, onSuccess }: Props) {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<ImportErrorCode | null>(null);

  const schema = z.object({
    payload: z
      .string()
      .trim()
      .min(1, { message: t('dialog.import.error-required') }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { payload: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      reset({ payload: '' });
      setServerError(null);
    }
  }, [open, reset]);

  const close = () => onOpenChange(false);

  const onSubmit = (values: FormValues) => {
    const result = onImport(values.payload);
    if (!result.ok) {
      setServerError(result.code);
      return;
    }
    onOpenChange(false);
    onSuccess(result.id);
  };

  const errorMessage =
    errors.payload?.message ??
    (serverError === 'invalid-json'
      ? t('dialog.import.error-invalid-json')
      : serverError === 'incompatible-schema'
        ? t('dialog.import.error-incompatible-schema')
        : null);

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('dialog.import.title')}
      footer={
        <>
          <GhostButton onClick={close}>{t('dialog.common.cancel')}</GhostButton>
          <PrimaryButton type="submit" form="import-character-form" disabled={!isValid}>
            {t('dialog.import.submit')}
          </PrimaryButton>
        </>
      }
    >
      <form
        id="import-character-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <label className="flex flex-col gap-1">
          <span className="font-label text-microlabel tracking-[0.22em] uppercase text-ink-red">
            {t('dialog.import.label')}
          </span>
          <textarea
            {...register('payload', {
              onChange: () => setServerError(null),
            })}
            rows={8}
            placeholder={t('dialog.import.placeholder')}
            spellCheck={false}
            className="bg-parchment border border-ink-red/40 outline-none font-mono text-xs text-ink-navy p-2 resize-y focus:border-ink-red focus-visible:ring-2 focus-visible:ring-ink-red/30 transition-colors"
          />
        </label>
        {errorMessage && (
          <p role="alert" className="font-body text-sm text-ink-red">
            {errorMessage}
          </p>
        )}
      </form>
    </Modal>
  );
}
