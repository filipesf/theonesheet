import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { DestructiveButton, GhostButton } from './dialog-buttons';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterName: string;
  onConfirm: () => void;
};

export function DeleteCharacterDialog({ open, onOpenChange, characterName, onConfirm }: Props) {
  const { t } = useTranslation();
  const confirmRef = useRef<HTMLButtonElement>(null);

  const close = () => onOpenChange(false);

  const confirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      variant="destructive"
      title={t('dialog.delete.title')}
      description={t('dialog.delete.body', { name: characterName })}
      initialFocusRef={confirmRef}
      footer={
        <>
          <GhostButton onClick={close}>{t('dialog.common.cancel')}</GhostButton>
          <DestructiveButton ref={confirmRef} onClick={confirm}>
            {t('dialog.delete.submit')}
          </DestructiveButton>
        </>
      }
    />
  );
}
