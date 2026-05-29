import { memo } from 'react';
import Button from '@/components/button';
import Modal from '@/components/modal';
import type { ConfirmModalProps } from './ConfirmModal.type';
import { footerActionsStyle, messageStyle } from './ConfirmModal.style';

const ConfirmModal = memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = '확인',
    cancelLabel = '취소',
    confirmVariant = 'danger',
    isConfirming = false,
    confirmingLabel,
  }: ConfirmModalProps) => {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="sm"
        closeOnOverlay={!isConfirming}
        footer={
          <div css={footerActionsStyle}>
            <Button fullWidth variant="secondary" onClick={onClose} disabled={isConfirming}>
              {cancelLabel}
            </Button>
            <Button fullWidth variant={confirmVariant} onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? (confirmingLabel ?? confirmLabel) : confirmLabel}
            </Button>
          </div>
        }
      >
        {message ? <p css={messageStyle}>{message}</p> : null}
      </Modal>
    );
  },
);

ConfirmModal.displayName = 'ConfirmModal';
export default ConfirmModal;
