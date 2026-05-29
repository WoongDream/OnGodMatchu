import { memo, useCallback, useMemo } from 'react';
import { EMPTY_SLOT, applyEditResult } from '@/lib/image/imageSlot';
import QuestionCard from './QuestionCard';
import QuestionItem, { type QuestionItemErrors } from './QuestionItem';
import { type DraftQuestion } from './questionTypes';
import type { QuestionErrorMap } from './questionValidation';
import {
  sectionStyle,
  leftPaneStyle,
  leftHeaderStyle,
  leftTitleStyle,
  leftCaptionStyle,
  cardsGridStyle,
  rightPaneStyle,
  emptyHintStyle,
} from './QuestionsStep.style';

type QuestionsStepProps = {
  questions: DraftQuestion[];
  onChange: (questions: DraftQuestion[]) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  errors: QuestionErrorMap;
  /** 외부에서 errors 초기화/갱신 — 필드 변경 시 호출 */
  onClearError: (id: string, key: keyof QuestionItemErrors) => void;
  /** "+ 문제 추가" 카드 클릭 시 호출 — 현재 questions 의 validation 결과를 받아 호출자가 분기 */
  onRequestAdd: () => void;
};

const QuestionsStep = memo(
  ({
    questions,
    onChange,
    selectedId,
    onSelect,
    errors,
    onClearError,
    onRequestAdd,
  }: QuestionsStepProps) => {
    const selected = useMemo(
      () => questions.find((q) => q.id === selectedId) ?? null,
      [questions, selectedId],
    );
    const selectedIndex = selected ? questions.findIndex((q) => q.id === selected.id) : -1;
    const selectedErrors = selected ? errors[selected.id] : undefined;

    const handleChange = useCallback(
      (id: string, partial: Partial<DraftQuestion>) => {
        onChange(questions.map((q) => (q.id === id ? { ...q, ...partial } : q)));
      },
      [questions, onChange],
    );

    const handleDelete = useCallback(
      (id: string) => {
        const idx = questions.findIndex((q) => q.id === id);
        const next = questions.filter((q) => q.id !== id);
        onChange(next);
        if (next.length === 0) {
          return;
        }
        if (selectedId === id) {
          const fallbackIdx = Math.min(idx, next.length - 1);
          onSelect(next[fallbackIdx].id);
        }
      },
      [questions, onChange, onSelect, selectedId],
    );

    return (
      <section css={sectionStyle} aria-label="문제 목록 편집">
        <div css={leftPaneStyle}>
          <div css={leftHeaderStyle}>
            <h2 css={leftTitleStyle}>문제 목록</h2>
            <span css={leftCaptionStyle}>총 {questions.length} 개</span>
          </div>
          <div css={cardsGridStyle}>
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                variant="item"
                imageUrl={q.image.previewUrl}
                questionText={q.questionText}
                selected={q.id === selectedId}
                invalid={!!errors[q.id]}
                onClick={() => onSelect(q.id)}
                ariaLabel={`문제 ${i + 1} 카드`}
              />
            ))}
            <QuestionCard variant="add" onClick={onRequestAdd} />
          </div>
        </div>
        <div css={rightPaneStyle}>
          {selected ? (
            <QuestionItem
              index={selectedIndex}
              questionText={selected.questionText}
              answer={selected.answer}
              imageSlot={selected.image}
              answerImageSlot={selected.answerImage}
              answerImageSameAsQuestion={selected.answerImageSameAsQuestion}
              onQuestionChange={(value) => {
                handleChange(selected.id, { questionText: value });
                onClearError(selected.id, 'questionImageOrText');
              }}
              onAnswerChange={(value) => {
                handleChange(selected.id, { answer: value });
                onClearError(selected.id, 'answer');
              }}
              onImageApply={(result) => {
                handleChange(selected.id, { image: applyEditResult(selected.image, result) });
                onClearError(selected.id, 'questionImageOrText');
              }}
              onImageRemove={() => handleChange(selected.id, { image: { ...EMPTY_SLOT } })}
              onAnswerImageApply={(result) =>
                handleChange(selected.id, {
                  answerImage: applyEditResult(selected.answerImage, result),
                })
              }
              onAnswerImageRemove={() =>
                handleChange(selected.id, { answerImage: { ...EMPTY_SLOT } })
              }
              onAnswerImageSameAsQuestionChange={(sameAsQuestion) =>
                handleChange(selected.id, {
                  answerImageSameAsQuestion: sameAsQuestion,
                  ...(sameAsQuestion ? { answerImage: { ...EMPTY_SLOT } } : {}),
                })
              }
              onDelete={() => handleDelete(selected.id)}
              errors={selectedErrors}
            />
          ) : (
            <p css={emptyHintStyle}>
              왼쪽에서 문제 카드를 선택하거나, 「문제 추가」 카드를 눌러 새 문제를 만들어 주세요.
            </p>
          )}
        </div>
      </section>
    );
  },
);

QuestionsStep.displayName = 'QuestionsStep';
export default QuestionsStep;
