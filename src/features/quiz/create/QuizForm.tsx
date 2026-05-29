import { memo, useCallback, useMemo, useState } from 'react';
import { css, type Theme } from '@emotion/react';
import Button from '@/components/button';
import Toggle from '@/components/toggle';
import QuizCreateStepper, { type QuizCreateStepKey } from '@/components/quiz-create-stepper';
import { EMPTY_SLOT, applyEditResult, type ImageSlot } from '@/lib/image/imageSlot';
import type { Category } from '@/types';
import QuizInfoForm, { type QuizInfoFormErrors } from './QuizInfoForm';
import QuestionsStep from './QuestionsStep';
import { createEmptyQuestion, type DraftQuestion } from './questionTypes';
import { validateAllQuestions, type QuestionErrorMap } from './questionValidation';
import type { QuestionItemErrors } from './QuestionItem';

export type QuizFormInitialValues = {
  title: string;
  description: string;
  category: Category | null;
  thumbnail: ImageSlot;
  isPublic: boolean;
  questions: DraftQuestion[];
};

export type QuizFormSubmitData = {
  title: string;
  description: string;
  category: Category;
  thumbnail: ImageSlot;
  isPublic: boolean;
  questions: DraftQuestion[];
};

type QuizFormProps = {
  initialValues: QuizFormInitialValues;
  onSubmit: (data: QuizFormSubmitData) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  submitLabel: string;
  submittingLabel: string;
};

type InternalState = QuizFormInitialValues;

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

const footerStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    & > *:first-of-type {
      grid-row: 2;
    }
  }
`;

const validateInfo = (form: InternalState): QuizInfoFormErrors => {
  const errors: QuizInfoFormErrors = {};
  if (form.title.trim() === '') {
    errors.title = '퀴즈 제목을 입력해주세요';
  }
  if (form.description.trim() === '') {
    errors.description = '퀴즈 설명을 입력해주세요';
  }
  if (form.category === null) {
    errors.category = '카테고리를 1개 이상 선택해주세요';
  }
  return errors;
};

const QuizForm = memo(
  ({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting,
    submitError,
    submitLabel,
    submittingLabel,
  }: QuizFormProps) => {
    const [step, setStep] = useState<QuizCreateStepKey>('info');
    const [infoErrors, setInfoErrors] = useState<QuizInfoFormErrors>({});
    const [questionErrors, setQuestionErrors] = useState<QuestionErrorMap>({});
    const [form, setForm] = useState<InternalState>(() => ({
      title: initialValues.title,
      description: initialValues.description,
      category: initialValues.category,
      thumbnail: initialValues.thumbnail,
      isPublic: initialValues.isPublic,
      questions:
        initialValues.questions.length > 0 ? initialValues.questions : [createEmptyQuestion()],
    }));
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
      () => (initialValues.questions[0] ?? null)?.id ?? form.questions[0]?.id ?? null,
    );

    const clearInfoError = useCallback((key: keyof QuizInfoFormErrors) => {
      setInfoErrors((prev) => {
        if (!prev[key]) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, []);

    const clearQuestionError = useCallback((id: string, key: keyof QuestionItemErrors) => {
      setQuestionErrors((prev) => {
        const existing = prev[id];
        if (!existing || !existing[key]) {
          return prev;
        }
        const updated = { ...existing };
        delete updated[key];
        const next = { ...prev };
        if (Object.keys(updated).length === 0) {
          delete next[id];
        } else {
          next[id] = updated;
        }
        return next;
      });
    }, []);

    const handleGoToQuestions = useCallback(() => {
      const errs = validateInfo(form);
      if (Object.keys(errs).length > 0) {
        setInfoErrors(errs);
        return;
      }
      setInfoErrors({});
      setStep('questions');
    }, [form]);

    const handleBackToInfo = useCallback(() => {
      setStep('info');
    }, []);

    const handleRequestAddQuestion = useCallback(() => {
      const errs = validateAllQuestions(form.questions);
      if (Object.keys(errs).length > 0) {
        setQuestionErrors(errs);
        const firstInvalidId = form.questions.find((q) => errs[q.id])?.id;
        if (firstInvalidId) {
          setSelectedQuestionId(firstInvalidId);
        }
        return;
      }
      setQuestionErrors({});
      const next = createEmptyQuestion();
      setForm((prev) => ({ ...prev, questions: [...prev.questions, next] }));
      setSelectedQuestionId(next.id);
    }, [form.questions]);

    const submittable = useMemo(() => {
      return (
        form.title.trim() !== '' &&
        form.description.trim() !== '' &&
        form.category !== null &&
        form.questions.length > 0 &&
        Object.keys(validateAllQuestions(form.questions)).length === 0
      );
    }, [form]);

    const handleSubmit = useCallback(async () => {
      if (!form.category) {
        return;
      }
      const errs = validateAllQuestions(form.questions);
      if (Object.keys(errs).length > 0) {
        setQuestionErrors(errs);
        const firstInvalidId = form.questions.find((q) => errs[q.id])?.id;
        if (firstInvalidId) {
          setSelectedQuestionId(firstInvalidId);
        }
        return;
      }
      setQuestionErrors({});
      await onSubmit({
        title: form.title,
        description: form.description,
        category: form.category,
        thumbnail: form.thumbnail,
        isPublic: form.isPublic,
        questions: form.questions,
      });
    }, [form, onSubmit]);

    const visibilityCard = (
      <section css={visibilityCardStyle} aria-label="공개 설정">
        <div css={visibilityTextStyle}>
          <span css={visibilityTitleStyle}>공개 설정</span>
          <span css={visibilityHintStyle}>
            {form.isPublic
              ? '공개 상태입니다. 다른 사용자가 풀 수 있습니다.'
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
      <>
        <QuizCreateStepper
          currentStep={step}
          onStepClick={(target) => {
            if (target === 'info') {
              setStep('info');
            }
          }}
        />
        {step === 'info' ? (
          <>
            <QuizInfoForm
              title={form.title}
              description={form.description}
              category={form.category}
              thumbnailSlot={form.thumbnail}
              onTitleChange={(value) => {
                setForm((prev) => ({ ...prev, title: value }));
                clearInfoError('title');
              }}
              onDescriptionChange={(value) => {
                setForm((prev) => ({ ...prev, description: value }));
                clearInfoError('description');
              }}
              onCategoryChange={(value) => {
                setForm((prev) => ({ ...prev, category: value }));
                clearInfoError('category');
              }}
              onThumbnailApply={(result) =>
                setForm((prev) => ({ ...prev, thumbnail: applyEditResult(prev.thumbnail, result) }))
              }
              onThumbnailRemove={() =>
                setForm((prev) => ({ ...prev, thumbnail: { ...EMPTY_SLOT } }))
              }
              belowCategorySlot={visibilityCard}
              errors={infoErrors}
            />
            <div css={footerStyle}>
              <Button variant="secondary" onClick={onCancel}>
                취소
              </Button>
              <Button onClick={handleGoToQuestions}>문제 목록 ›</Button>
            </div>
          </>
        ) : (
          <>
            <QuestionsStep
              questions={form.questions}
              onChange={(questions) => setForm((prev) => ({ ...prev, questions }))}
              selectedId={selectedQuestionId}
              onSelect={setSelectedQuestionId}
              errors={questionErrors}
              onClearError={clearQuestionError}
              onRequestAdd={handleRequestAddQuestion}
            />
            {submitError && (
              <div css={errorBannerStyle} role="alert">
                {submitError}
              </div>
            )}
            <div css={footerStyle}>
              <Button variant="secondary" onClick={handleBackToInfo}>
                ‹ 퀴즈 정보
              </Button>
              <Button onClick={handleSubmit} disabled={!submittable || isSubmitting}>
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </div>
          </>
        )}
      </>
    );
  },
);

QuizForm.displayName = 'QuizForm';
export default QuizForm;
