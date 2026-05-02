import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { css, type Theme } from '@emotion/react';
import Button from '@/components/button';
import { pageWrapperStyle } from '@/styles/layout';
import QuizInfoForm from '@/features/quiz-create/QuizInfoForm';
import QuestionList, {
  type DraftQuestion,
  createEmptyQuestion,
} from '@/features/quiz-create/QuestionList';
import useCreateQuiz from '@/hooks/useCreateQuiz';
import type { Category } from '@/types';

type QuizForm = {
  title: string;
  description: string;
  category: Category | null;
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string | null;
  questions: DraftQuestion[];
};

const dividerStyle = (theme: Theme) => css`
  border: none;
  border-top: 1px solid ${theme.colors.border.primary};
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
  const { submit, isSubmitting, error } = useCreateQuiz();
  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    category: null,
    thumbnailFile: null,
    thumbnailPreviewUrl: null,
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
      questions: form.questions.map((q) => ({
        imageFile: q.imageFile,
        answerImageFile: q.answerImageFile,
        answerImageSameAsQuestion: q.answerImageSameAsQuestion,
        questionText: q.questionText,
        answer: q.answer,
      })),
    });
    if (result) {
      navigate(`/quiz/${result.id}`);
    }
  }, [form, submit, navigate]);

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
