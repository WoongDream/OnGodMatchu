export type MenuItemKey =
  | 'info'
  | 'quizzes-made'
  | 'quizzes-played'
  | 'quizzes-starred'
  | 'account';

export type MenuGroupId = 'quiz';

export type MenuItem = {
  key: MenuItemKey;
  label: string;
  mobileLabel?: string;
  to: string;
  countKey?: 'createdQuizCount' | 'playCount';
  myOnly?: boolean;
  groupId?: MenuGroupId;
};

export type MenuGroup = {
  id: MenuGroupId;
  label: string;
};

export const PROFILE_MENU_GROUPS: Record<MenuGroupId, MenuGroup> = {
  quiz: { id: 'quiz', label: '퀴즈' },
};

export const PROFILE_MENU_ITEMS: MenuItem[] = [
  { key: 'info', label: '내 정보', to: '' },
  {
    key: 'quizzes-made',
    label: '내가 만든',
    mobileLabel: '내가 만든 퀴즈',
    to: 'quizzes-made',
    countKey: 'createdQuizCount',
    groupId: 'quiz',
  },
  {
    key: 'quizzes-played',
    label: '내가 푼',
    mobileLabel: '내가 푼 퀴즈',
    to: 'quizzes-played',
    countKey: 'playCount',
    groupId: 'quiz',
  },
  {
    key: 'quizzes-starred',
    label: '스타 준',
    mobileLabel: '스타 준 퀴즈',
    to: 'quizzes-starred',
    myOnly: true,
    groupId: 'quiz',
  },
  { key: 'account', label: '계정', to: 'account', myOnly: true },
];

export const buildBaseTo = (userId?: number): string =>
  userId === undefined ? '/profile' : `/profile/${userId}`;

export const resolveTo = (base: string, item: MenuItem): string =>
  item.to === '' ? base : `${base}/${item.to}`;
