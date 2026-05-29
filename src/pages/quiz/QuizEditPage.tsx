import { useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { pageWrapperStyle } from '@/styles/layout';
import QuizForm, {
  type QuizFormInitialValues,
  type QuizFormSubmitData,
} from '@/features/quiz/create/QuizForm';
import type { DraftQuestion } from '@/features/quiz/create/questionTypes';
import { slotFromServer } from '@/lib/image/imageSlot';
import useQuizDetail from '@/hooks/useQuizDetail';
import useUpdateQuiz from '@/hooks/useUpdateQuiz';
import useAuthStore from '@/store/authStore';
import type { Quiz, Question } from '@/types';
import { noticeStyle } from './QuizEditPage.style';

const hydrateQuestion = (server: Question): DraftQuestion => {
  const imageKey = server.imageKey ?? null;
  const answerImageKey = server.answerImageKey ?? null;
  return {
    id: crypto.randomUUID(),
    serverId: server.id,
    questionText: server.questionText ?? '',
    answer: server.answer,
    image: slotFromServer({
      imageKey,
      imageUrl: server.imageUrl,
      originalImageKey: server.originalImageKey,
      originalImageUrl: server.originalImageUrl,
      transform: server.imageTransform,
    }),
    answerImage: slotFromServer({
      imageKey: answerImageKey,
      imageUrl: server.answerImageUrl,
      originalImageKey: server.originalAnswerImageKey,
      originalImageUrl: server.originalAnswerImageUrl,
      transform: server.answerImageTransform,
    }),
    answerImageSameAsQuestion: imageKey !== null && imageKey === answerImageKey,
  };
};

type QuizEditFormProps = {
  quizId: number;
  quiz: Quiz & { questions: Question[] };
};

const QuizEditForm = ({ quizId, quiz }: QuizEditFormProps) => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { submit, isSubmitting, error: submitError } = useUpdateQuiz();

  const initialValues = useMemo<QuizFormInitialValues>(
    () => ({
      title: quiz.title,
      description: quiz.description ?? '',
      category: quiz.category,
      thumbnail: slotFromServer({
        imageKey: quiz.thumbnailKey,
        imageUrl: quiz.thumbnailUrl,
        originalImageKey: quiz.originalThumbnailKey,
        originalImageUrl: quiz.originalThumbnailUrl,
        transform: quiz.thumbnailTransform,
      }),
      isPublic: quiz.isPublic,
      questions: quiz.questions.map(hydrateQuestion),
    }),
    [quiz],
  );

  const handleSubmit = useCallback(
    async (data: QuizFormSubmitData) => {
      const result = await submit(quizId, {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        category: data.category,
        isPublic: data.isPublic,
        thumbnail: data.thumbnail,
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
    [submit, quizId, mutate, navigate],
  );

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div css={pageWrapperStyle('lg')}>
      <QuizForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitError={submitError}
        submitLabel="변경 사항 저장"
        submittingLabel="저장 중..."
      />
    </div>
  );
};

const QuizEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);
  const me = useAuthStore((s) => s.user);
  const { quiz, isLoading, error: loadError } = useQuizDetail(quizId);

  if (isLoading) {
    return (
      <div css={pageWrapperStyle('lg')}>
        <p css={noticeStyle}>퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div css={pageWrapperStyle('lg')}>
        <div css={noticeStyle}>
          <span>퀴즈를 불러오지 못했습니다.</span>
          <Link to="/profile/quizzes-made">목록으로</Link>
        </div>
      </div>
    );
  }

  const isOwner = !!me && quiz.authorNickname === me.nickname;
  if (!isOwner) {
    return (
      <div css={pageWrapperStyle('lg')}>
        <div css={noticeStyle}>
          <span>이 퀴즈를 편집할 권한이 없습니다.</span>
          <Link to="/profile/quizzes-made">목록으로</Link>
        </div>
      </div>
    );
  }

  return <QuizEditForm quizId={quizId} quiz={quiz} />;
};

export default QuizEditPage;
