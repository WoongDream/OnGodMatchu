import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/button';
import type { StartOption } from '@/components/quiz-play-options';
import { pageWrapperStyle } from '@/styles/layout';
import QuizProgress from '@/features/quiz/play/QuizProgress';
import QuizTimer from '@/features/quiz/play/QuizTimer';
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
  const timeLimitSec = option?.timeLimitSec ?? null;
  const hasTimer = timeLimitSec !== null && timeLimitSec > 0;

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
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [phase, setPhase] = useState<Phase>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [remainingSec, setRemainingSec] = useState<number>(timeLimitSec ?? 0);

  const { submit, isSubmitting, error: submitError } = useSubmitAttempt();

  const finalize = useCallback(
    async (latest: Record<number, string>) => {
      const payload: AttemptAnswerInput[] = questions.map((q) => ({
        questionId: q.id,
        userAnswer: latest[q.id] ?? '',
      }));
      const result = await submit(quizId, payload, timeLimitSec);
      if (result) {
        navigate(`/quiz/${quizId}/result`, {
          state: { result, questions },
        });
      }
    },
    [questions, submit, quizId, navigate, timeLimitSec],
  );

  const currentQuestion = questions[currentIndex];

  const inputValueRef = useRef(inputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const finalizeAnswer = useCallback(
    (allowEmpty: boolean) => {
      if (!currentQuestion) {
        return;
      }
      const trimmed = inputValueRef.current.trim();
      if (!allowEmpty && trimmed === '') {
        return;
      }
      const correct = trimmed !== '' && normalize(trimmed) === normalize(currentQuestion.answer);
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: trimmed }));
      setLastCorrect(correct);
      setSubmittedAnswer(trimmed);
      setPhase('feedback');
    },
    [currentQuestion],
  );

  useEffect(() => {
    if (!hasTimer || phase !== 'answering') {
      return;
    }
    const id = setInterval(() => {
      setRemainingSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [hasTimer, phase, currentIndex]);

  useEffect(() => {
    if (!hasTimer || phase !== 'answering') {
      return;
    }
    if (remainingSec === 0) {
      finalizeAnswer(true);
    }
  }, [remainingSec, phase, hasTimer, finalizeAnswer]);

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

  const total = questions.length;
  const isLastQuestion = currentIndex === total - 1;

  const handleAdvance = () => {
    if (isLastQuestion) {
      void finalize({ ...answers, [currentQuestion.id]: submittedAnswer });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setInputValue('');
    setSubmittedAnswer('');
    setPhase('answering');
    if (hasTimer) {
      setRemainingSec(timeLimitSec ?? 0);
    }
  };

  return (
    <div css={pageWrapperStyle('lg')}>
      <QuizProgress
        current={currentIndex + 1}
        total={total}
        trailing={
          hasTimer && phase === 'answering' ? (
            <QuizTimer remainingSec={remainingSec} totalSec={timeLimitSec ?? 0} />
          ) : null
        }
      />
      <QuizQuestion question={currentQuestion} />
      {phase === 'answering' ? (
        <QuizAnswer
          value={inputValue}
          onChange={setInputValue}
          onSubmit={() => finalizeAnswer(false)}
          disabled={isSubmitting}
          focusKey={`${currentIndex}-${phase}`}
        />
      ) : (
        <QuizFeedback
          correct={lastCorrect}
          answer={currentQuestion.answer}
          userAnswer={submittedAnswer}
          onNext={handleAdvance}
          nextAriaLabel={isLastQuestion ? '결과 보기' : '다음 문제'}
          nextDisabled={isSubmitting}
        />
      )}
      {submitError && <p role="alert">{submitError}</p>}
    </div>
  );
});

QuizPlayPage.displayName = 'QuizPlayPage';
export default QuizPlayPage;
