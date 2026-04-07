import { memo } from 'react';
import Input from '@/components/input';
import ImageUpload from '@/components/image-upload';
import { ItemWrapper, ItemHeader, ItemNumber, ItemActions, IconButton } from './QuestionItem.style';

type QuestionItemProps = {
  index: number;
  questionText: string;
  answer: string;
  imagePreviewUrl: string | null;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onImageChange: (file: File, url: string) => void;
  onImageRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const QuestionItem = memo(
  ({
    index,
    questionText,
    answer,
    imagePreviewUrl,
    onQuestionChange,
    onAnswerChange,
    onImageChange,
    onImageRemove,
    onMoveUp,
    onMoveDown,
    onDelete,
    isFirst,
    isLast,
  }: QuestionItemProps) => {
    return (
      <ItemWrapper>
        <ItemHeader>
          <ItemNumber>{index + 1}번 문제</ItemNumber>
          <ItemActions>
            <IconButton onClick={onMoveUp} disabled={isFirst} aria-label="위로">
              ↑
            </IconButton>
            <IconButton onClick={onMoveDown} disabled={isLast} aria-label="아래로">
              ↓
            </IconButton>
            <IconButton onClick={onDelete} aria-label="삭제">
              ✕
            </IconButton>
          </ItemActions>
        </ItemHeader>
        <ImageUpload
          label="문제 이미지 (선택)"
          previewUrl={imagePreviewUrl}
          onChange={onImageChange}
          onRemove={onImageRemove}
        />
        <Input
          label="문제"
          value={questionText}
          onChange={onQuestionChange}
          placeholder="문제를 입력하세요"
        />
        <Input
          label="정답"
          value={answer}
          onChange={onAnswerChange}
          placeholder="정답을 입력하세요"
        />
      </ItemWrapper>
    );
  },
);

QuestionItem.displayName = 'QuestionItem';
export default QuestionItem;
