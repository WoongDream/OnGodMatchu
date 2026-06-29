import { memo } from 'react';
import Button from '@/components/button/Button';
import type { NotificationType } from '@/types';
import { footerStyle } from './NotificationModal.style';

type Props = {
  type: NotificationType;
  confirmLabel?: string;
  onConfirm: () => void;
  onInquiry: () => void;
};

/**
 * 알림 모달 하단 버튼 규칙(공용). INFO(안내) → [확인]만 / WARNING(경고) → [확인][문의하기].
 * 자동 팝업 큐 모달의 마지막 알림과 받은 알림 화면 모달이 같은 규칙을 공유한다.
 */
const NotificationActions = memo(({ type, confirmLabel = '확인', onConfirm, onInquiry }: Props) => (
  <div css={footerStyle}>
    <Button variant="primary" fullWidth onClick={onConfirm}>
      {confirmLabel}
    </Button>
    {type === 'WARNING' && (
      <Button variant="secondary" fullWidth onClick={onInquiry}>
        문의하기
      </Button>
    )}
  </div>
));

NotificationActions.displayName = 'NotificationActions';
export default NotificationActions;
