import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import ResultScore from '@/features/quiz-result/ResultScore';
import ResultActions from '@/features/quiz-result/ResultActions';

type ResultState = {
  scores: number;
  total: number;
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

  const handleRetry = () => {
    navigate(`/quiz/${id}`);
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <PageWrapper>
      <ResultScore scores={state.scores} total={state.total} />
      <ResultActions quizId={Number(id)} onRetry={handleRetry} onHome={handleHome} />
    </PageWrapper>
  );
};

export default QuizResultPage;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;
