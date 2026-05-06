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

  const { quiz, isLoading } = useQuizDetail(quizId);
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

  if (isLoading || !quiz) {
    return <div>로딩 중...</div>;
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
