export type Category = '게임' | '음악' | '문화' | '방송' | '기타';

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
