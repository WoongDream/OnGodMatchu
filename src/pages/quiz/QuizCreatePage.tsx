import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { pageWrapperStyle } from '@/styles/layout';
import QuizForm, {
  type QuizFormInitialValues,
  type QuizFormSubmitData,
} from '@/features/quiz/create/QuizForm';
import useCreateQuiz from '@/hooks/useCreateQuiz';

const INITIAL_VALUES: QuizFormInitialValues = {
  title: '',
  description: '',
  category: null,
  thumbnailPreviewUrl: null,
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
        thumbnailFile: data.thumbnailFile,
        isPublic: data.isPublic,
        questions: data.questions.map((q) => ({
          imageFile: q.imageFile,
          answerImageFile: q.answerImageFile,
          answerImageSameAsQuestion: q.answerImageSameAsQuestion,
          questionText: q.questionText,
          answer: q.answer,
        })),
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
