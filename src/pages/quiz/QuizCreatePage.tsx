import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { css, type Theme } from '@emotion/react';
import Button from '@/components/button';
import Toggle from '@/components/toggle';
import { pageWrapperStyle } from '@/styles/layout';
import QuizInfoForm from '@/features/quiz/create/QuizInfoForm';
import QuestionList, {
  type DraftQuestion,
  createEmptyQuestion,
} from '@/features/quiz/create/QuestionList';
import useCreateQuiz from '@/hooks/useCreateQuiz';
import type { Category } from '@/types';

type QuizForm = {
  title: string;
  description: string;
  category: Category | null;
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string | null;
  isPublic: boolean;
  questions: DraftQuestion[];
};

const dividerStyle = (theme: Theme) => css`
  border: none;
  border-top: 1px solid ${theme.colors.border.primary};
`;

const visibilityCardStyle = (theme: Theme) => css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

const visibilityTextStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const visibilityTitleStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

const visibilityHintStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  line-height: 1.4;
`;

const errorBannerStyle = (theme: Theme) => css`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.status.error};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.status.error};
  background-color: ${theme.colors.bg.secondary};
  font-size: 0.875rem;
`;

const QuizCreatePage = () => {
  const navigate = useNavigate();
  const { mutate } = useSWRConfig();
  const { submit, isSubmitting, error } = useCreateQuiz();
  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    category: null,
    thumbnailFile: null,
    thumbnailPreviewUrl: null,
    isPublic: false,
    questions: [createEmptyQuestion()],
  });

  const isValid =
    form.title.trim() !== '' &&
    form.category !== null &&
    form.questions.length > 0 &&
    form.questions.every((q) => q.questionText.trim() !== '' && q.answer.trim() !== '');

  const handleSubmit = useCallback(async () => {
    if (!form.category) {
      return;
    }
    const result = await submit({
      title: form.title,
      description: form.description,
      category: form.category,
      thumbnailFile: form.thumbnailFile,
      isPublic: form.isPublic,
      questions: form.questions.map((q) => ({
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
  }, [form, submit, mutate, navigate]);

  const visibilityCard = (
    <section css={visibilityCardStyle} aria-label="공개 설정">
      <div css={visibilityTextStyle}>
        <span css={visibilityTitleStyle}>공개 설정</span>
        <span css={visibilityHintStyle}>
          {form.isPublic
            ? '공개 상태입니다. 공개 시 다른 사용자가 풀 수 있습니다.'
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
      <QuestionList
        questions={form.questions}
        onChange={(questions) => setForm((prev) => ({ ...prev, questions }))}
      />
      {error && (
        <div css={errorBannerStyle} role="alert">
          {error}
        </div>
      )}
      <Button fullWidth disabled={!isValid || isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? '저장 중...' : '퀴즈 저장'}
      </Button>
    </div>
  );
};

export default QuizCreatePage;
