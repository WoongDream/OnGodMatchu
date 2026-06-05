import { memo } from 'react';
import type { NotificationType } from '@/types';
import { typeBadgeStyle } from './NotificationModal.style';

type Props = {
  type: NotificationType;
  /** '안내' | '경고' 표시 라벨. */
  label: string;
};

/** 알림 유형 배지 — WARNING(경고) 노랑 / INFO(안내) 파랑. 수신 모달·리스트·받은 알림 화면 공용. */
const NotificationTypeBadge = memo(({ type, label }: Props) => (
  <span css={(theme) => typeBadgeStyle(theme, type)}>{label}</span>
));

NotificationTypeBadge.displayName = 'NotificationTypeBadge';
export default NotificationTypeBadge;
