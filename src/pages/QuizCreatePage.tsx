import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Button from '@/components/button';
import { PageWrapper } from '@/styles/layout';
import QuizInfoForm from '@/features/quiz-create/QuizInfoForm';
import QuestionList, { type DraftQuestion } from '@/features/quiz-create/QuestionList';
import type { Category } from '@/types';

type QuizForm = {
  title: string;
  description: string;
  category: Category | null;
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string | null;
  questions: DraftQuestion[];
};

const QuizCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    category: null,
    thumbnailFile: null,
    thumbnailPreviewUrl: null,
    questions: [
      {
        id: crypto.randomUUID(),
        questionText: '',
        answer: '',
        imageFile: null,
        imagePreviewUrl: null,
      },
    ],
  });

  const isValid =
    form.title.trim() !== '' &&
    form.category !== null &&
    form.questions.length > 0 &&
    form.questions.every((q) => q.questionText.trim() !== '' && q.answer.trim() !== '');

  const handleSubmit = useCallback(() => {
    // TODO: API 연동
    alert('퀴즈가 저장됐어요! (API 연동 전)');
    navigate('/');
  }, [navigate]);

  return (
    <PageWrapper gap="xl">
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
      <Divider />
      <QuestionList
        questions={form.questions}
        onChange={(questions) => setForm((prev) => ({ ...prev, questions }))}
      />
      <Button fullWidth disabled={!isValid} onClick={handleSubmit}>
        퀴즈 저장
      </Button>
    </PageWrapper>
  );
};

export default QuizCreatePage;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`;
