import { memo } from 'react';
import Input from '@/components/input';
import ImageUpload from '@/components/image-upload';
import {
  wrapperStyle,
  headerStyle,
  headerLeftStyle,
  numberStyle,
  invalidPillStyle,
  actionsStyle,
  iconButtonStyle,
  deleteButtonStyle,
  checkboxRowStyle,
  sameAsQuestionHintStyle,
  questionBlockStyle,
  questionInstructionStyle,
  questionFieldGroupStyle,
  answerBlockStyle,
  answerHeadingStyle,
  fieldErrorStyle,
} from './QuestionItem.style';

export type QuestionItemErrors = {
  /** 문제 이미지/텍스트 중 하나는 있어야 함. */
  questionImageOrText?: string;
  /** 정답 텍스트 필수. */
  answer?: string;
};

export type QuestionItemProps = {
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
  /** 미지정 시 위로 버튼 미노출. */
  onMoveUp?: () => void;
  /** 미지정 시 아래로 버튼 미노출. */
  onMoveDown?: () => void;
  onDelete: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  /** 외부에서 트리거된 검증 에러. */
  errors?: QuestionItemErrors;
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
    isFirst = false,
    isLast = false,
    errors,
  }: QuestionItemProps) => {
    const hasAnyError = !!(errors?.questionImageOrText || errors?.answer);
    const questionInvalid = !!errors?.questionImageOrText;
    const answerInvalid = !!errors?.answer;

    return (
      <div css={wrapperStyle(hasAnyError)}>
        <div css={headerStyle}>
          <div css={headerLeftStyle}>
            <span css={numberStyle}>문제 {index + 1}</span>
            {hasAnyError && <span css={invalidPillStyle}>입력 필요</span>}
          </div>
          <div css={actionsStyle}>
            {onMoveUp && (
              <button css={iconButtonStyle} onClick={onMoveUp} disabled={isFirst} aria-label="위로">
                ↑
              </button>
            )}
            {onMoveDown && (
              <button
                css={iconButtonStyle}
                onClick={onMoveDown}
                disabled={isLast}
                aria-label="아래로"
              >
                ↓
              </button>
            )}
            <button css={deleteButtonStyle} onClick={onDelete} aria-label="삭제">
              삭제
            </button>
          </div>
        </div>

        <section css={questionBlockStyle}>
          <div css={questionFieldGroupStyle}>
            <p css={questionInstructionStyle}>이미지 또는 문제 텍스트를 입력해주세요</p>
            <ImageUpload
              previewUrl={imagePreviewUrl}
              onChange={onImageChange}
              onRemove={onImageRemove}
            />
            <Input
              value={questionText}
              onChange={onQuestionChange}
              placeholder="문제를 입력하세요"
            />
          </div>
          {questionInvalid && <span css={fieldErrorStyle}>{errors?.questionImageOrText}</span>}
        </section>

        <section css={answerBlockStyle}>
          <h3 css={answerHeadingStyle}>정답</h3>
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
              previewUrl={answerImagePreviewUrl}
              onChange={onAnswerImageChange}
              onRemove={onAnswerImageRemove}
            />
          )}
          <Input value={answer} onChange={onAnswerChange} placeholder="정답을 입력하세요" />
          {answerInvalid && <span css={fieldErrorStyle}>{errors?.answer}</span>}
        </section>
      </div>
    );
  },
);

QuestionItem.displayName = 'QuestionItem';
export default QuestionItem;
