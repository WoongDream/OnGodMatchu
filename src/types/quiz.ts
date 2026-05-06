export const CATEGORIES = [
  { value: 'entertainment', label: '연예인' },
  { value: 'movie', label: '영화' },
  { value: 'drama', label: '드라마' },
  { value: 'anime', label: '애니메이션' },
  { value: 'game', label: '게임' },
  { value: 'music', label: '음악' },
  { value: 'sports', label: '스포츠' },
  { value: 'general', label: '상식' },
  { value: 'etc', label: '기타' },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];

export type Quiz = {
  id: number;
  authorNickname: string;
  title: string;
  description: string;
  category: Category;
  thumbnailKey?: string | null;
  thumbnailUrl: string | null;
  playCount: number;
  isPublic: boolean;
  createdAt: string;
};

export type Question = {
  id: number;
  quizId: number;
  orderNum: number;
  imageKey?: string | null;
  imageUrl: string | null;
  answerImageKey?: string | null;
  answerImageUrl?: string | null;
  questionText: string | null;
  answer: string;
};
