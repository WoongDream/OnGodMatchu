import { memo } from 'react';
import Input from '@/components/input';
import ImageUpload from '@/components/image-upload';
import {
  wrapperStyle,
  headerStyle,
  numberStyle,
  actionsStyle,
  iconButtonStyle,
  sectionStyle,
  sectionHeadingStyle,
  checkboxRowStyle,
  sameAsQuestionHintStyle,
} from './QuestionItem.style';

type QuestionItemProps = {
  index: number;
  questionText: string;
  answer: string;
  imagePreviewUrl: string | null;
  answerImagePreviewUrl: string | null;
  answerImageSameAsQuestion: boolean;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onImageChange: (file: File, url: string) => void;
  onImageRemove: () => void;
  onAnswerImageChange: (file: File, url: string) => void;
  onAnswerImageRemove: () => void;
  onAnswerImageSameAsQuestionChange: (sameAsQuestion: boolean) => void;
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
    answerImagePreviewUrl,
    answerImageSameAsQuestion,
    onQuestionChange,
    onAnswerChange,
    onImageChange,
    onImageRemove,
    onAnswerImageChange,
    onAnswerImageRemove,
    onAnswerImageSameAsQuestionChange,
    onMoveUp,
    onMoveDown,
    onDelete,
    isFirst,
    isLast,
  }: QuestionItemProps) => {
    return (
      <div css={wrapperStyle}>
        <div css={headerStyle}>
          <span css={numberStyle}>{index + 1}번 문제</span>
          <div css={actionsStyle}>
            <button css={iconButtonStyle} onClick={onMoveUp} disabled={isFirst} aria-label="위로">
              ↑
            </button>
            <button
              css={iconButtonStyle}
              onClick={onMoveDown}
              disabled={isLast}
              aria-label="아래로"
            >
              ↓
            </button>
            <button css={iconButtonStyle} onClick={onDelete} aria-label="삭제">
              ✕
            </button>
          </div>
        </div>

        <section css={sectionStyle}>
          <h3 css={sectionHeadingStyle}>문제</h3>
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
        </section>

        <section css={sectionStyle}>
          <h3 css={sectionHeadingStyle}>정답</h3>
          <label css={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={answerImageSameAsQuestion}
              onChange={(e) => onAnswerImageSameAsQuestionChange(e.target.checked)}
            />
            문제 이미지와 동일하게 사용
          </label>
          {answerImageSameAsQuestion ? (
            <p css={sameAsQuestionHintStyle}>정답 이미지로 문제 이미지를 그대로 사용해요.</p>
          ) : (
            <ImageUpload
              label="정답 이미지 (선택)"
              previewUrl={answerImagePreviewUrl}
              onChange={onAnswerImageChange}
              onRemove={onAnswerImageRemove}
            />
          )}
          <Input
            label="정답"
            value={answer}
            onChange={onAnswerChange}
            placeholder="정답을 입력하세요"
          />
        </section>
      </div>
    );
  },
);

QuestionItem.displayName = 'QuestionItem';
export default QuestionItem;
