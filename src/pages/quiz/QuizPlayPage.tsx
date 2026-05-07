import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/button';
import { pageWrapperStyle } from '@/styles/layout';
import QuizProgress from '@/features/quiz/play/QuizProgress';
import QuizQuestion from '@/features/quiz/play/QuizQuestion';
import QuizAnswer from '@/features/quiz/play/QuizAnswer';
import useQuizDetail from '@/hooks/useQuizDetail';
import useSubmitAttempt from '@/hooks/useSubmitAttempt';
import type { AttemptAnswerInput } from '@/types';

const QuizPlayPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quizId = Number(id);

  const { quiz, isLoading, error } = useQuizDetail(quizId);
  const questions = useMemo(() => quiz?.questions ?? [], [quiz]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const { submit, isSubmitting, error: submitError } = useSubmitAttempt();

  const finalize = useCallback(
    async (latest: Record<number, string>) => {
      const payload: AttemptAnswerInput[] = questions.map((q) => ({
        questionId: q.id,
        userAnswer: latest[q.id] ?? '',
      }));
      const result = await submit(quizId, payload);
      if (result) {
        navigate(`/quiz/${quizId}/result`, {
          state: { result, questions },
        });
      }
    },
    [questions, submit, quizId, navigate],
  );

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error || !quiz) {
    const status = (error as { response?: { status?: number } } | null | undefined)?.response
      ?.status;
    const message =
      status === 403 || status === 404
        ? '비공개 퀴즈이거나 존재하지 않는 퀴즈입니다.'
        : '퀴즈를 불러오지 못했습니다.';
    return (
      <div css={pageWrapperStyle('lg')}>
        <p>{message}</p>
        <Button fullWidth onClick={() => navigate('/')}>
          홈으로
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const isLastQuestion = currentIndex === total - 1;

  const handleNext = () => {
    const trimmed = inputValue.trim();
    const next = { ...answers, [currentQuestion.id]: trimmed };
    setAnswers(next);

    if (isLastQuestion) {
      void finalize(next);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setInputValue('');
  };

  const canSubmit = inputValue.trim() !== '' && !isSubmitting;

  return (
    <div css={pageWrapperStyle('lg')}>
      <QuizProgress current={currentIndex + 1} total={total} />
      <QuizQuestion question={currentQuestion} />
      <QuizAnswer
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleNext}
        disabled={isSubmitting}
      />
      {submitError && <p role="alert">{submitError}</p>}
      <Button
        fullWidth
        variant={isLastQuestion ? 'primary' : 'secondary'}
        onClick={handleNext}
        disabled={!canSubmit}
      >
        {isLastQuestion ? (isSubmitting ? '채점 중...' : '결과 보기') : '다음 문제'}
      </Button>
    </div>
  );
});

export default QuizPlayPage;
