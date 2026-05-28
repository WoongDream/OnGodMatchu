import { memo, useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/button';
import type { StartOption } from '@/components/quiz-play-options';
import { pageWrapperStyle } from '@/styles/layout';
import QuizProgress from '@/features/quiz/play/QuizProgress';
import QuizQuestion from '@/features/quiz/play/QuizQuestion';
import QuizAnswer from '@/features/quiz/play/QuizAnswer';
import QuizFeedback from '@/features/quiz/play/QuizFeedback';
import useQuizDetail from '@/hooks/useQuizDetail';
import useSubmitAttempt from '@/hooks/useSubmitAttempt';
import { shuffle } from '@/lib/quiz/shuffle';
import type { AttemptAnswerInput } from '@/types';

type Phase = 'answering' | 'feedback';

const normalize = (value: string) => value.trim().normalize('NFC').toLowerCase();

const QuizPlayPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const quizId = Number(id);
  const option = (location.state as StartOption | null) ?? null;

  const { quiz, isLoading, error } = useQuizDetail(quizId);
  const questions = useMemo(() => {
    const all = quiz?.questions ?? [];
    if (all.length === 0) {
      return all;
    }
    if (!option) {
      return all;
    }
    const shuffled = option.shuffle ? shuffle(all) : all;
    const take = Math.min(option.count, shuffled.length);
    return shuffled.slice(0, take);
  }, [quiz, option]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [phase, setPhase] = useState<Phase>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);

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

  const handleSubmitAnswer = () => {
    if (phase !== 'answering') {
      return;
    }
    const trimmed = inputValue.trim();
    if (trimmed === '') {
      return;
    }
    const correct = normalize(trimmed) === normalize(currentQuestion.answer);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: trimmed }));
    setLastCorrect(correct);
    setPhase('feedback');
  };

  const handleAdvance = () => {
    if (isLastQuestion) {
      void finalize({ ...answers, [currentQuestion.id]: inputValue.trim() });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setInputValue('');
    setPhase('answering');
  };

  const handlePrimary = () => {
    if (phase === 'answering') {
      handleSubmitAnswer();
    } else {
      handleAdvance();
    }
  };

  const buttonLabel = (() => {
    if (phase === 'answering') {
      return '제출';
    }
    if (isLastQuestion) {
      return isSubmitting ? '채점 중...' : '결과 보기';
    }
    return '다음 문제';
  })();

  const buttonDisabled =
    phase === 'answering' ? inputValue.trim() === '' || isSubmitting : isSubmitting;

  return (
    <div css={pageWrapperStyle('lg')}>
      <QuizProgress current={currentIndex + 1} total={total} />
      <QuizQuestion question={currentQuestion} hideImage={phase === 'feedback'} />
      {phase === 'feedback' && (
        <QuizFeedback
          correct={lastCorrect}
          answer={currentQuestion.answer}
          answerImageUrl={currentQuestion.answerImageUrl ?? currentQuestion.imageUrl}
        />
      )}
      <QuizAnswer
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmitAnswer}
        disabled={phase === 'feedback' || isSubmitting}
      />
      {submitError && <p role="alert">{submitError}</p>}
      <Button
        fullWidth
        variant={phase === 'feedback' && isLastQuestion ? 'primary' : 'secondary'}
        onClick={handlePrimary}
        disabled={buttonDisabled}
      >
        {buttonLabel}
      </Button>
    </div>
  );
});

QuizPlayPage.displayName = 'QuizPlayPage';
export default QuizPlayPage;
