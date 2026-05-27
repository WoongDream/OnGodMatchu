import { memo, useCallback } from 'react';
import Button from '@/components/button';
import QuestionItem from './QuestionItem';
import { sectionStyle, sectionTitleStyle, listWrapperStyle } from './QuestionList.style';

export type DraftQuestion = {
  id: string;
  serverId?: number;
  questionText: string;
  answer: string;
  imageKey: string | null;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  answerImageKey: string | null;
  answerImageFile: File | null;
  answerImagePreviewUrl: string | null;
  answerImageSameAsQuestion: boolean;
};

type QuestionListProps = {
  questions: DraftQuestion[];
  onChange: (questions: DraftQuestion[]) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const createEmptyQuestion = (): DraftQuestion => ({
  id: crypto.randomUUID(),
  questionText: '',
  answer: '',
  imageKey: null,
  imageFile: null,
  imagePreviewUrl: null,
  answerImageKey: null,
  answerImageFile: null,
  answerImagePreviewUrl: null,
  answerImageSameAsQuestion: true,
});

const QuestionList = memo(({ questions, onChange }: QuestionListProps) => {
  const handleAdd = useCallback(() => {
    onChange([...questions, createEmptyQuestion()]);
  }, [questions, onChange]);

  const handleChange = useCallback(
    (id: string, partial: Partial<DraftQuestion>) => {
      onChange(questions.map((q) => (q.id === id ? { ...q, ...partial } : q)));
    },
    [questions, onChange],
  );

  const handleDelete = useCallback(
    (id: string) => {
      onChange(questions.filter((q) => q.id !== id));
    },
    [questions, onChange],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index === 0) {
        return;
      }
      const next = [...questions];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      onChange(next);
    },
    [questions, onChange],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index === questions.length - 1) {
        return;
      }
      const next = [...questions];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      onChange(next);
    },
    [questions, onChange],
  );

  return (
    <section css={sectionStyle}>
      <h2 css={sectionTitleStyle}>문제 목록</h2>
      <div css={listWrapperStyle}>
        {questions.map((q, index) => (
          <QuestionItem
            key={q.id}
            index={index}
            questionText={q.questionText}
            answer={q.answer}
            imagePreviewUrl={q.imagePreviewUrl}
            answerImagePreviewUrl={q.answerImagePreviewUrl}
            answerImageSameAsQuestion={q.answerImageSameAsQuestion}
            onQuestionChange={(value) => handleChange(q.id, { questionText: value })}
            onAnswerChange={(value) => handleChange(q.id, { answer: value })}
            onImageChange={(file, url) =>
              handleChange(q.id, { imageFile: file, imagePreviewUrl: url })
            }
            onImageRemove={() => handleChange(q.id, { imageFile: null, imagePreviewUrl: null })}
            onAnswerImageChange={(file, url) =>
              handleChange(q.id, { answerImageFile: file, answerImagePreviewUrl: url })
            }
            onAnswerImageRemove={() =>
              handleChange(q.id, { answerImageFile: null, answerImagePreviewUrl: null })
            }
            onAnswerImageSameAsQuestionChange={(sameAsQuestion) =>
              handleChange(q.id, {
                answerImageSameAsQuestion: sameAsQuestion,
                ...(sameAsQuestion ? { answerImageFile: null, answerImagePreviewUrl: null } : {}),
              })
            }
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            onDelete={() => handleDelete(q.id)}
            isFirst={index === 0}
            isLast={index === questions.length - 1}
          />
        ))}
      </div>
      <Button variant="secondary" onClick={handleAdd}>
        + 문제 추가
      </Button>
    </section>
  );
});

QuestionList.displayName = 'QuestionList';
export default QuestionList;
