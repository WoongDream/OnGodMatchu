import { useCallback, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Button from '@/components/button';
import Toggle from '@/components/toggle';
import { pageWrapperStyle } from '@/styles/layout';
import QuizInfoForm from '@/features/quiz/create/QuizInfoForm';
import useQuizDetail from '@/hooks/useQuizDetail';
import useUpdateQuiz from '@/hooks/useUpdateQuiz';
import useAuthStore from '@/store/authStore';
import type { Category, Quiz, Question } from '@/types';
import {
  dividerStyle,
  visibilityCardStyle,
  visibilityTextStyle,
  visibilityTitleStyle,
  visibilityHintStyle,
  errorBannerStyle,
  noticeStyle,
  buttonsRowStyle,
} from './QuizEditPage.style';

type EditForm = {
  title: string;
  description: string;
  category: Category;
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string | null;
  isPublic: boolean;
};

type QuizEditFormProps = {
  quizId: number;
  quiz: Quiz & { questions: Question[] };
};

const QuizEditForm = ({ quizId, quiz }: QuizEditFormProps) => {
  const navigate = useNavigate();
  const { submit, isSubmitting, error: submitError } = useUpdateQuiz();
  const [form, setForm] = useState<EditForm>(() => ({
    title: quiz.title,
    description: quiz.description ?? '',
    category: quiz.category,
    thumbnailFile: null,
    thumbnailPreviewUrl: quiz.thumbnailUrl ?? null,
    isPublic: quiz.isPublic,
  }));

  const isValid = form.title.trim() !== '';

  const handleSave = useCallback(async () => {
    const result = await submit(quizId, {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      isPublic: form.isPublic,
      thumbnailFile: form.thumbnailFile,
    });
    if (result) {
      navigate(`/quiz/${quizId}`);
    }
  }, [form, submit, quizId, navigate]);

  const visibilityCard = (
    <section css={visibilityCardStyle} aria-label="공개 설정">
      <div css={visibilityTextStyle}>
        <span css={visibilityTitleStyle}>공개 설정</span>
        <span css={visibilityHintStyle}>
          {form.isPublic
            ? '공개 시 다른 사용자가 풀 수 있습니다.'
            : '비공개 상태입니다. 본인만 볼 수 있어요.'}
        </span>
      </div>
      <Toggle
        checked={form.isPublic}
        onChange={(next) => setForm((prev) => ({ ...prev, isPublic: next }))}
        ariaLabel="공개 설정"
      />
    </section>
  );

  return (
    <div css={pageWrapperStyle('xl')}>
      <QuizInfoForm
        title={form.title}
        description={form.description}
        category={form.category}
        thumbnailPreviewUrl={form.thumbnailPreviewUrl}
        onTitleChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
        onDescriptionChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
        onCategoryChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
        onThumbnailChange={(file, url) =>
          setForm((prev) => ({ ...prev, thumbnailFile: file, thumbnailPreviewUrl: url }))
        }
        onThumbnailRemove={() =>
          setForm((prev) => ({ ...prev, thumbnailFile: null, thumbnailPreviewUrl: null }))
        }
        belowTitleSlot={visibilityCard}
      />
      <hr css={dividerStyle} />
      {submitError && (
        <div css={errorBannerStyle} role="alert">
          {submitError}
        </div>
      )}
      <div css={buttonsRowStyle}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button disabled={!isValid || isSubmitting} onClick={handleSave}>
          {isSubmitting ? '저장 중...' : '변경 사항 저장'}
        </Button>
      </div>
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
      <div css={pageWrapperStyle('xl')}>
        <p css={noticeStyle}>퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div css={pageWrapperStyle('xl')}>
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
      <div css={pageWrapperStyle('xl')}>
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
