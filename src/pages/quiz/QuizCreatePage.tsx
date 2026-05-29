import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { pageWrapperStyle } from '@/styles/layout';
import { EMPTY_SLOT } from '@/lib/image/imageSlot';
import QuizForm, {
  type QuizFormInitialValues,
  type QuizFormSubmitData,
} from '@/features/quiz/create/QuizForm';
import useCreateQuiz from '@/hooks/useCreateQuiz';

const INITIAL_VALUES: QuizFormInitialValues = {
  title: '',
  description: '',
  category: null,
  thumbnail: { ...EMPTY_SLOT },
  isPublic: false,
  questions: [],
};

const QuizCreatePage = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { submit, isSubmitting, error } = useCreateQuiz();

  const handleSubmit = useCallback(
    async (data: QuizFormSubmitData) => {
      const result = await submit({
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        isPublic: data.isPublic,
        questions: data.questions,
      });
      if (result) {
        await mutate(
          (key) =>
            Array.isArray(key) && (key[0] === 'my-quizzes' || key[0] === 'my-quizzes-aggregate'),
        );
        navigate('/profile/quizzes-made');
      }
    },
    [submit, mutate, navigate],
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div css={pageWrapperStyle('lg')}>
      <QuizForm
        initialValues={INITIAL_VALUES}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitError={error}
        submitLabel="퀴즈 완성 ✓"
        submittingLabel="저장 중..."
      />
    </div>
  );
};

export default QuizCreatePage;
