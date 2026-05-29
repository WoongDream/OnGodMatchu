import { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@/components/button';
import Modal from '@/components/modal';
import type { LoginPromptModalProps } from './LoginPromptModal.type';
import { footerActionsStyle, messageStyle } from './LoginPromptModal.style';

const LoginPromptModal = memo(
  ({
    isOpen,
    onClose,
    title = '로그인이 필요해요',
    message = '로그인하고 다른 사람들과 의견을 나눠보세요.',
  }: LoginPromptModalProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = () => {
      onClose();
      navigate('/login', { state: { from: location.pathname + location.search } });
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="sm"
        footer={
          <div css={footerActionsStyle}>
            <Button fullWidth onClick={handleLogin}>
              로그인하러 가기
            </Button>
            <Button fullWidth variant="secondary" onClick={onClose}>
              닫기
            </Button>
          </div>
        }
      >
        <p css={messageStyle}>{message}</p>
      </Modal>
    );
  },
);

LoginPromptModal.displayName = 'LoginPromptModal';
export default LoginPromptModal;
