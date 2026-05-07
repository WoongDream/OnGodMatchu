import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { pageWrapperStyle } from '@/styles/layout';
import ResultScore from '@/features/quiz/result/ResultScore';
import ResultActions from '@/features/quiz/result/ResultActions';
import ResultDetailList from '@/features/quiz/result/ResultDetailList';
import type { AttemptResponse, Question } from '@/types';

type ResultState = {
  result: AttemptResponse;
  questions: Question[];
};

const QuizResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ResultState | null;

  useEffect(() => {
    if (!state) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { result, questions } = state;

  const handleRetry = () => {
    navigate(`/quiz/${id}`);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div css={pageWrapperStyle('xl')}>
      <ResultScore scores={result.score} total={result.totalQuestions} />
      <ResultDetailList questions={questions} results={result.results} />
      <ResultActions quizId={Number(id)} onRetry={handleRetry} onHome={handleHome} />
    </div>
  );
};

export default QuizResultPage;
