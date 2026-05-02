import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import QuestionItem from './QuestionItem';

const meta: Meta<typeof QuestionItem> = {
  title: 'Features/QuizCreate/QuestionItem',
  component: QuestionItem,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof QuestionItem>;

const noopFile = () => {};

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
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialImagePreview ?? null,
  );
  const [answerImagePreviewUrl, setAnswerImagePreviewUrl] = useState<string | null>(
    initialAnswerImagePreview ?? null,
  );
  const [sameAsQuestion, setSameAsQuestion] = useState(initialSameAsQuestion);

  return (
    <div style={{ maxWidth: '560px', padding: '1rem' }}>
      <QuestionItem
        index={0}
        questionText={questionText}
        answer={answer}
        imagePreviewUrl={imagePreviewUrl}
        answerImagePreviewUrl={answerImagePreviewUrl}
        answerImageSameAsQuestion={sameAsQuestion}
        onQuestionChange={setQuestionText}
        onAnswerChange={setAnswer}
        onImageChange={(_, url) => setImagePreviewUrl(url)}
        onImageRemove={() => setImagePreviewUrl(null)}
        onAnswerImageChange={(_, url) => setAnswerImagePreviewUrl(url)}
        onAnswerImageRemove={() => setAnswerImagePreviewUrl(null)}
        onAnswerImageSameAsQuestionChange={(next) => {
          setSameAsQuestion(next);
          if (next) {
            setAnswerImagePreviewUrl(null);
          }
        }}
        onMoveUp={noopFile}
        onMoveDown={noopFile}
        onDelete={noopFile}
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
