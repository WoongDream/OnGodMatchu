import { memo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/button';
import { pageWrapperStyle } from '@/styles/layout';
import QuizProgress from '@/features/quiz/play/QuizProgress';
import QuizQuestion from '@/features/quiz/play/QuizQuestion';
import QuizAnswer from '@/features/quiz/play/QuizAnswer';
import QuizFeedback from '@/features/quiz/play/QuizFeedback';
import useQuizDetail from '@/hooks/useQuizDetail';
import { incrementPlayCount, gradeAnswer } from '@/api/quiz';

type SubmitState = { status: 'idle' } | { status: 'correct' } | { status: 'wrong'; answer: string };

const QuizPlayPage = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quizId = Number(id);

  const { quiz, isLoading, error } = useQuizDetail(quizId);
  const questions = quiz?.questions ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [scores, setScores] = useState(0);

  useEffect(() => {
    if (quizId) {
      incrementPlayCount(quizId);
    }
  }, [quizId]);

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

  const handleSubmit = async () => {
    const res = await gradeAnswer(currentQuestion.id, inputValue.trim());
    if (res.correct) {
      setScores((prev) => prev + 1);
      setSubmitState({ status: 'correct' });
    } else {
      setSubmitState({ status: 'wrong', answer: res.correctAnswer });
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      navigate(`/quiz/${quiz.id}/result`, { state: { scores, total } });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setInputValue('');
    setSubmitState({ status: 'idle' });
  };

  const isAnswered = submitState.status !== 'idle';

  return (
    <div css={pageWrapperStyle('lg')}>
      <QuizProgress current={currentIndex + 1} total={total} />
      <QuizQuestion question={currentQuestion} revealAnswer={isAnswered} />
      <QuizAnswer
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={isAnswered}
      />
      {isAnswered && (
        <>
          <QuizFeedback
            correct={submitState.status === 'correct'}
            answer={submitState.status === 'wrong' ? submitState.answer : currentQuestion.answer}
          />
          <Button fullWidth variant={isLastQuestion ? 'primary' : 'secondary'} onClick={handleNext}>
            {isLastQuestion ? '결과 보기' : '다음 문제'}
          </Button>
        </>
      )}
    </div>
  );
});

export default QuizPlayPage;
