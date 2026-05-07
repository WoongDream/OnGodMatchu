import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { Question } from '@/types/quiz';
import type { AttemptResultItem } from '@/types/attempt';
import ResultDetailList from './ResultDetailList';

// Isolate child components — only test ResultDetailList's own logic
vi.mock('@/features/quiz/play/QuizQuestion', () => ({
  default: ({ question }: { question: Question; revealAnswer?: boolean }) => (
    <div data-testid={`quiz-question-${question.id}`}>{question.questionText}</div>
  ),
}));

vi.mock('@/features/quiz/play/QuizFeedback', () => ({
  default: ({ correct, answer }: { correct: boolean; answer: string }) => (
    <div data-testid={`quiz-feedback-${correct ? 'correct' : 'wrong'}`}>
      {correct ? '정답이에요!' : `오답이에요 - ${answer}`}
    </div>
  ),
}));

// --- 픽스처 ---

const makeQuestion = (id: number, text: string): Question => ({
  id,
  quizId: 1,
  orderNum: id,
  imageKey: null,
  imageUrl: null,
  answerImageKey: null,
  answerImageUrl: null,
  questionText: text,
  answer: `정답${id}`,
});

const makeResult = (
  questionId: number,
  userAnswer: string,
  correct: boolean,
): AttemptResultItem => ({
  questionId,
  userAnswer,
  correctAnswer: `정답${questionId}`,
  correct,
  correctAnswerImageUrl: null,
});

// -------------------------------------------------------------------

describe('ResultDetailList', () => {
  describe('목록 렌더링', () => {
    it('questions 길이만큼 li 를 렌더한다', () => {
      const questions = [
        makeQuestion(1, '문제1'),
        makeQuestion(2, '문제2'),
        makeQuestion(3, '문제3'),
      ];
      const results = [
        makeResult(1, '답1', true),
        makeResult(2, '답2', false),
        makeResult(3, '답3', true),
      ];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it('question 이 1개일 때 li 를 1개 렌더한다', () => {
      renderWithTheme(
        <ResultDetailList
          questions={[makeQuestion(1, '문제1')]}
          results={[makeResult(1, '답', true)]}
        />,
      );

      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('questions 가 빈 배열이면 li 를 렌더하지 않는다', () => {
      renderWithTheme(<ResultDetailList questions={[]} results={[]} />);

      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });

    it('ol 태그를 루트로 렌더한다', () => {
      const { container } = renderWithTheme(
        <ResultDetailList
          questions={[makeQuestion(1, '문제1')]}
          results={[makeResult(1, '답', true)]}
        />,
      );

      expect(container.querySelector('ol')).toBeInTheDocument();
    });
  });

  describe('"문제 N" 라벨', () => {
    it('각 카드에 "문제 N" 라벨을 순서대로 노출한다', () => {
      const questions = [makeQuestion(10, 'Q1'), makeQuestion(20, 'Q2'), makeQuestion(30, 'Q3')];
      const results = [
        makeResult(10, '답1', true),
        makeResult(20, '답2', false),
        makeResult(30, '답3', true),
      ];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      expect(screen.getByText('문제 1')).toBeInTheDocument();
      expect(screen.getByText('문제 2')).toBeInTheDocument();
      expect(screen.getByText('문제 3')).toBeInTheDocument();
    });

    it('문제 라벨이 questions 배열 순서(인덱스)를 따른다', () => {
      // id 순서와 무관하게 배열 순서로 번호가 매겨져야 한다
      const questions = [makeQuestion(99, 'Q99'), makeQuestion(1, 'Q1')];
      const results = [makeResult(99, '답', true), makeResult(1, '답', false)];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      const labels = screen.getAllByText(/^문제 \d+$/);
      expect(labels[0]).toHaveTextContent('문제 1');
      expect(labels[1]).toHaveTextContent('문제 2');
    });
  });

  describe('"정답" / "오답" 배지', () => {
    it('correct=true 이면 "정답" 배지를 렌더한다', () => {
      renderWithTheme(
        <ResultDetailList
          questions={[makeQuestion(1, '문제')]}
          results={[makeResult(1, '답', true)]}
        />,
      );

      expect(screen.getByText('정답')).toBeInTheDocument();
      expect(screen.queryByText('오답')).not.toBeInTheDocument();
    });

    it('correct=false 이면 "오답" 배지를 렌더한다', () => {
      renderWithTheme(
        <ResultDetailList
          questions={[makeQuestion(1, '문제')]}
          results={[makeResult(1, '틀린답', false)]}
        />,
      );

      expect(screen.getByText('오답')).toBeInTheDocument();
      expect(screen.queryByText('정답')).not.toBeInTheDocument();
    });

    it('카드가 여러 개일 때 정답/오답 배지가 각각 노출된다', () => {
      const questions = [makeQuestion(1, 'Q1'), makeQuestion(2, 'Q2')];
      const results = [makeResult(1, '답', true), makeResult(2, '답', false)];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      expect(screen.getByText('정답')).toBeInTheDocument();
      expect(screen.getByText('오답')).toBeInTheDocument();
    });
  });

  describe('"내 답:" 노출', () => {
    it('userAnswer 가 있으면 p 태그에 "내 답: {userAnswer}" 전체 텍스트를 노출한다', () => {
      renderWithTheme(
        <ResultDetailList
          questions={[makeQuestion(1, '문제')]}
          results={[makeResult(1, '서울', true)]}
        />,
      );

      // <p><span>내 답: </span>서울</p> 구조 — 전체 텍스트로 조회
      expect(
        screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === '내 답: 서울'),
      ).toBeInTheDocument();
    });

    it('userAnswer 가 빈 문자열이면 "(미입력)" 을 노출한다', () => {
      renderWithTheme(
        <ResultDetailList
          questions={[makeQuestion(1, '문제')]}
          results={[makeResult(1, '', false)]}
        />,
      );

      expect(screen.getByText('(미입력)')).toBeInTheDocument();
    });

    it('여러 카드의 userAnswer 가 각각 노출된다', () => {
      const questions = [makeQuestion(1, 'Q1'), makeQuestion(2, 'Q2')];
      const results = [makeResult(1, '첫번째답', true), makeResult(2, '두번째답', false)];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      expect(screen.getByText('첫번째답')).toBeInTheDocument();
      expect(screen.getByText('두번째답')).toBeInTheDocument();
    });
  });

  describe('questionId 매칭 실패 시 미렌더', () => {
    it('results 에 매칭되는 questionId 가 없는 question 은 렌더하지 않는다', () => {
      const questions = [makeQuestion(1, 'Q1'), makeQuestion(999, 'Q999 — 매칭없음')];
      // results 에는 id=1 만 존재
      const results = [makeResult(1, '답', true)];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      // id=1 카드는 렌더됨
      expect(screen.getByText('문제 1')).toBeInTheDocument();
      // id=999 카드는 렌더되지 않음
      expect(screen.queryByText('문제 2')).not.toBeInTheDocument();
      // li 는 1개만
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('results 가 빈 배열이면 모든 question 이 미렌더된다', () => {
      const questions = [makeQuestion(1, 'Q1'), makeQuestion(2, 'Q2')];

      renderWithTheme(<ResultDetailList questions={questions} results={[]} />);

      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });

    it('전체 questions 가 results 와 불일치하면 li 를 0개 렌더한다', () => {
      const questions = [makeQuestion(1, 'Q1'), makeQuestion(2, 'Q2')];
      const results = [makeResult(10, '답', true), makeResult(20, '답', false)];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });
  });

  describe('자식 컴포넌트 위임', () => {
    it('각 카드에 QuizQuestion 을 렌더한다', () => {
      const questions = [makeQuestion(1, '문제1'), makeQuestion(2, '문제2')];
      const results = [makeResult(1, '답', true), makeResult(2, '답', false)];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      expect(screen.getByTestId('quiz-question-1')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-question-2')).toBeInTheDocument();
    });

    it('각 카드에 QuizFeedback 을 렌더한다', () => {
      const questions = [makeQuestion(1, '문제')];
      const results = [makeResult(1, '답', true)];

      renderWithTheme(<ResultDetailList questions={questions} results={results} />);

      expect(screen.getByTestId('quiz-feedback-correct')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "ResultDetailList" 로 설정돼 있다', () => {
      expect(ResultDetailList.displayName).toBe('ResultDetailList');
    });
  });
});
