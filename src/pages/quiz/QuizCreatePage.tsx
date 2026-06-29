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
import useAuthStore from '@/store/authStore';
import { isSuspended } from '@/lib/auth/role';
import SuspensionNotice from '@/features/suspension/SuspensionNotice';

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
  const user = useAuthStore((s) => s.user);
  const suspended = isSuspended(user);

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

  if (suspended) {
    return (
      <div css={pageWrapperStyle('lg')}>
        <SuspensionNotice
          until={user?.suspendedUntil}
          message="정지된 계정은 퀴즈를 만들 수 없어요."
        />
      </div>
    );
  }

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
