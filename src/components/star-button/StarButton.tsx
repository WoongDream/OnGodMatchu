import { memo } from 'react';
import { StarIcon } from '@/components/icon';
import { formatCount } from '@/lib/format/count';
import type { StarButtonProps } from './StarButton.type';
import {
  chipLabelStyle,
  chipStyle,
  countLabelStyle,
  getIconSize,
  iconButtonStyle,
} from './StarButton.style';

const StarButton = memo(
  ({
    active,
    count,
    variant = 'icon',
    size = 'md',
    disabled = false,
    showCount = true,
    onClick,
  }: StarButtonProps) => {
    const label = active ? '좋아요 취소' : '좋아요';
    const iconSize = getIconSize(size);

    if (variant === 'chip') {
      return (
        <button
          type="button"
          css={chipStyle(active, size)}
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          onClick={onClick}
        >
          <span css={chipLabelStyle}>
            <StarIcon size={iconSize} aria-hidden />
            <span>스타</span>
          </span>
          {showCount && typeof count === 'number' && (
            <span css={countLabelStyle}>{formatCount(count)}</span>
          )}
        </button>
      );
    }

    return (
      <button
        type="button"
        css={iconButtonStyle(active, size)}
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
      >
        <StarIcon size={iconSize} aria-hidden />
        {showCount && typeof count === 'number' && (
          <span css={countLabelStyle}>{formatCount(count)}</span>
        )}
      </button>
    );
  },
);

StarButton.displayName = 'StarButton';
export default StarButton;
