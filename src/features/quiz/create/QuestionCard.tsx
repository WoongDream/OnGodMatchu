import { memo } from 'react';
import { PlusIcon } from '@/components/icon';
import type { QuestionCardProps } from './QuestionCard.type';
import {
  itemCardStyle,
  imageStyle,
  textStyle,
  placeholderTextStyle,
  addCardStyle,
  addLabelStyle,
  alertBadgeStyle,
} from './QuestionCard.style';

const QuestionCard = memo(
  ({
    variant = 'item',
    imageUrl,
    questionText,
    selected = false,
    invalid = false,
    onClick,
    ariaLabel,
  }: QuestionCardProps) => {
    if (variant === 'add') {
      return (
        <button
          type="button"
          css={addCardStyle({ invalid })}
          onClick={onClick}
          aria-label={ariaLabel ?? '문제 추가'}
        >
          <PlusIcon size={24} />
          <span css={addLabelStyle}>문제 추가</span>
        </button>
      );
    }

    const trimmedText = (questionText ?? '').trim();
    return (
      <button
        type="button"
        css={itemCardStyle({ selected, invalid })}
        onClick={onClick}
        aria-pressed={selected}
        aria-label={ariaLabel}
      >
        {imageUrl ? (
          <img css={imageStyle} src={imageUrl} alt="" />
        ) : trimmedText !== '' ? (
          <span css={textStyle}>{trimmedText}</span>
        ) : (
          <span css={placeholderTextStyle}>비어 있음</span>
        )}
        {invalid && (
          <span css={alertBadgeStyle} aria-label="입력 필요" role="img">
            !
          </span>
        )}
      </button>
    );
  },
);

QuestionCard.displayName = 'QuestionCard';
export default QuestionCard;
