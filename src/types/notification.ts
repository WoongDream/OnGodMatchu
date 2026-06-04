/** 사용자 알림 유형 — 안내(INFO) / 경고(WARNING). 표시 라벨은 typeLabel 사용. */
export type NotificationType = 'INFO' | 'WARNING';

/** 사용자가 수신하는 알림 (BE UserNotification 응답). */
export type UserNotification = {
  id: number;
  type: NotificationType;
  /** '안내' | '경고' — BE 가 내려주는 표시 라벨. */
  typeLabel: string;
  title: string;
  content: string;
  /** 발신자 표시명 ('운영팀'). */
  senderLabel: string;
  createdAt: string;
};

/** 관리자가 작성하는 알림 입력. */
export type NotificationDraft = {
  type: NotificationType;
  title: string;
  content: string;
};
