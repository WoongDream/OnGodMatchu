import type { Quiz, Question } from '@/types';

const MOCK_QUIZ_1: Quiz = {
  id: 1,
  authorNickname: '운영자',
  title: '90년대 명곡 맞추기',
  description: '들으면 다 알지만 제목은 모르는 그 노래들',
  category: 'music',
  thumbnailUrl: null,
  playCount: 1243,
  createdAt: '2025-03-01T00:00:00Z',
};

const MOCK_QUESTIONS_1: Question[] = [
  {
    id: 1,
    quizId: 1,
    orderNum: 1,
    imageUrl: null,
    questionText: '1998년 발매된 god의 데뷔곡 제목은?',
    answer: '어머니께',
  },
  {
    id: 2,
    quizId: 1,
    orderNum: 2,
    imageUrl: null,
    questionText: '"난 알아요" 를 부른 가수는?',
    answer: '서태지와 아이들',
  },
  {
    id: 3,
    quizId: 1,
    orderNum: 3,
    imageUrl: null,
    questionText: '핑클의 1999년 히트곡으로, "난 외로워..." 로 시작하는 곡은?',
    answer: '영원한 사랑',
  },
  {
    id: 4,
    quizId: 1,
    orderNum: 4,
    imageUrl: null,
    questionText: 'H.O.T.의 "캔디"가 수록된 앨범 이름은?',
    answer: 'We Hate All Kinds Of Violence',
  },
  {
    id: 5,
    quizId: 1,
    orderNum: 5,
    imageUrl: null,
    questionText: '조성모의 1999년 발매곡으로 "아시나요" 의 후속 히트곡은?',
    answer: 'To Heaven',
  },
];

const MOCK_QUIZ_2: Quiz = {
  id: 2,
  authorNickname: '운영자',
  title: '롤 챔피언 스킬 맞추기',
  description: '진짜 롤 고수만 맞출 수 있는 스킬 퀴즈',
  category: 'game',
  thumbnailUrl: null,
  playCount: 3821,
  createdAt: '2025-03-05T00:00:00Z',
};

const MOCK_QUESTIONS_2: Question[] = [
  {
    id: 6,
    quizId: 2,
    orderNum: 1,
    imageUrl: null,
    questionText: '티모의 궁극기 이름은?',
    answer: '독버섯 심기',
  },
  {
    id: 7,
    quizId: 2,
    orderNum: 2,
    imageUrl: null,
    questionText: '야스오의 패시브 스킬 이름은?',
    answer: '길 위의 전사',
  },
  {
    id: 8,
    quizId: 2,
    orderNum: 3,
    imageUrl: null,
    questionText: '럭스의 Q스킬 이름은?',
    answer: '빛의 속박',
  },
  {
    id: 9,
    quizId: 2,
    orderNum: 4,
    imageUrl: null,
    questionText: '리 신의 궁극기 이름은?',
    answer: '용의 분노',
  },
  {
    id: 10,
    quizId: 2,
    orderNum: 5,
    imageUrl: null,
    questionText: '진의 W스킬 이름은?',
    answer: '마성의 연무',
  },
];

type MockData = {
  quiz: Quiz;
  questions: Question[];
};

export const getMockDataById = (id: number): MockData => {
  if (id % 2 === 0) {
    return { quiz: MOCK_QUIZ_2, questions: MOCK_QUESTIONS_2 };
  }
  return { quiz: MOCK_QUIZ_1, questions: MOCK_QUESTIONS_1 };
};
