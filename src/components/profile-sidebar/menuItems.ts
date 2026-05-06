export type MenuItemKey = 'info' | 'quizzes-made' | 'quizzes-played' | 'settings' | 'account';

export type MenuItem = {
  key: MenuItemKey;
  label: string;
  to: string;
  countKey?: 'createdQuizCount' | 'playCount';
  myOnly?: boolean;
};

export const PROFILE_MENU_ITEMS: MenuItem[] = [
  { key: 'info', label: '내 정보', to: '' },
  { key: 'quizzes-made', label: '만든 퀴즈', to: 'quizzes-made', countKey: 'createdQuizCount' },
  { key: 'quizzes-played', label: '푼 퀴즈', to: 'quizzes-played', countKey: 'playCount' },
  { key: 'settings', label: '환경설정', to: 'settings', myOnly: true },
  { key: 'account', label: '계정', to: 'account', myOnly: true },
];

export const buildBaseTo = (userId?: number): string =>
  userId === undefined ? '/profile' : `/profile/${userId}`;

export const resolveTo = (base: string, item: MenuItem): string =>
  item.to === '' ? base : `${base}/${item.to}`;
