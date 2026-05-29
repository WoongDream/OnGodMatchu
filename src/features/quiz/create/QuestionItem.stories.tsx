import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EMPTY_SLOT, applyEditResult, type ImageSlot } from '@/lib/image/imageSlot';
import QuestionItem from './QuestionItem';

const meta: Meta<typeof QuestionItem> = {
  title: 'Features/Quiz/Create/QuestionItem',
  component: QuestionItem,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof QuestionItem>;

const noop = () => {};

const slotWithPreview = (previewUrl: string): ImageSlot => ({ ...EMPTY_SLOT, previewUrl });

const InteractiveItem = ({
  initialSameAsQuestion,
  initialImagePreview,
  initialAnswerImagePreview,
}: {
  initialSameAsQuestion: boolean;
  initialImagePreview?: string;
  initialAnswerImagePreview?: string;
}) => {
  const [questionText, setQuestionText] = useState('이 사람은 누구일까요?');
  const [answer, setAnswer] = useState('홍길동');
  const [imageSlot, setImageSlot] = useState<ImageSlot>(
    initialImagePreview ? slotWithPreview(initialImagePreview) : EMPTY_SLOT,
  );
  const [answerImageSlot, setAnswerImageSlot] = useState<ImageSlot>(
    initialAnswerImagePreview ? slotWithPreview(initialAnswerImagePreview) : EMPTY_SLOT,
  );
  const [sameAsQuestion, setSameAsQuestion] = useState(initialSameAsQuestion);

  return (
    <div style={{ maxWidth: '560px', padding: '1rem' }}>
      <QuestionItem
        index={0}
        questionText={questionText}
        answer={answer}
        imageSlot={imageSlot}
        answerImageSlot={answerImageSlot}
        answerImageSameAsQuestion={sameAsQuestion}
        onQuestionChange={setQuestionText}
        onAnswerChange={setAnswer}
        onImageApply={(result) => setImageSlot((prev) => applyEditResult(prev, result))}
        onImageRemove={() => setImageSlot(EMPTY_SLOT)}
        onAnswerImageApply={(result) => setAnswerImageSlot((prev) => applyEditResult(prev, result))}
        onAnswerImageRemove={() => setAnswerImageSlot(EMPTY_SLOT)}
        onAnswerImageSameAsQuestionChange={(next) => {
          setSameAsQuestion(next);
          if (next) {
            setAnswerImageSlot(EMPTY_SLOT);
          }
        }}
        onMoveUp={noop}
        onMoveDown={noop}
        onDelete={noop}
        isFirst
        isLast
      />
    </div>
  );
};

export const Default_SameAsQuestion: Story = {
  name: '기본 — 「문제 이미지와 동일하게 사용」 ON',
  render: () => <InteractiveItem initialSameAsQuestion={true} />,
};

export const SeparateAnswerImage: Story = {
  name: '체크 해제 — 정답 이미지 별도 업로드 가능',
  render: () => <InteractiveItem initialSameAsQuestion={false} />,
};

export const WithSeparateAnswerPreview: Story = {
  name: '체크 해제 + 정답 이미지 미리보기',
  render: () => (
    <InteractiveItem
      initialSameAsQuestion={false}
      initialImagePreview="https://placehold.co/400x225?text=Question"
      initialAnswerImagePreview="https://placehold.co/400x225?text=Answer"
    />
  ),
};
