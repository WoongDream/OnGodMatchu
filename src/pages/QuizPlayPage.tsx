import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import Button from '@/components/button';
import QuizProgress from '@/features/quiz-play/QuizProgress';
import QuizQuestion from '@/features/quiz-play/QuizQuestion';
import QuizAnswer from '@/features/quiz-play/QuizAnswer';
import QuizFeedback from '@/features/quiz-play/QuizFeedback';
import { getMockDataById } from '@/features/quiz-play/mock';

type SubmitState = { status: 'idle' } | { status: 'correct' } | { status: 'wrong'; answer: string };

const QuizPlayPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { quiz, questions } = getMockDataById(Number(id));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const [scores, setScores] = useState(0);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const isLastQuestion = currentIndex === total - 1;

  const handleSubmit = useCallback(() => {
    const correct = inputValue.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();

    if (correct) {
      setScores((prev) => prev + 1);
      setSubmitState({ status: 'correct' });
    } else {
      setSubmitState({ status: 'wrong', answer: currentQuestion.answer });
    }
  }, [inputValue, currentQuestion.answer]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      navigate(`/quiz/${quiz.id}/result`, { state: { scores, total } });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setInputValue('');
    setSubmitState({ status: 'idle' });
  }, [isLastQuestion, navigate, quiz.id, scores, total]);

  return (
    <PageWrapper>
      <QuizProgress current={currentIndex + 1} total={total} />
      <QuizQuestion question={currentQuestion} />
      <QuizAnswer
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={submitState.status !== 'idle'}
      />
      {submitState.status !== 'idle' && (
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
    </PageWrapper>
  );
};

export default QuizPlayPage;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;
