export const CATEGORIES = [
  { value: 'game', label: '게임' },
  { value: 'music', label: '음악' },
  { value: 'culture', label: '문화' },
  { value: 'broadcast', label: '방송' },
  { value: 'etc', label: '기타' },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];

export type Quiz = {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: Category;
  thumbnailUrl: string | null;
  playCount: number;
  createdAt: string;
};

export type Question = {
  id: number;
  quizId: number;
  orderNum: number;
  imageUrl: string | null;
  questionText: string | null;
  answer: string;
};
