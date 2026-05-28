import { memo } from 'react';
import { ShareIcon } from '@/components/icon';
import { formatCount } from '@/lib/format/count';
import type { ShareButtonProps } from './ShareButton.type';
import {
  chipLabelStyle,
  chipStyle,
  countLabelStyle,
  getIconSize,
  iconButtonStyle,
} from './ShareButton.style';

const ShareButton = memo(
  ({
    count,
    variant = 'icon',
    size = 'md',
    disabled = false,
    showCount = true,
    onClick,
  }: ShareButtonProps) => {
    const iconSize = getIconSize(size);

    if (variant === 'chip') {
      return (
        <button
          type="button"
          css={chipStyle}
          aria-label="공유하기"
          disabled={disabled}
          onClick={onClick}
        >
          <span css={chipLabelStyle}>
            <ShareIcon size={iconSize} aria-hidden />
            <span>공유</span>
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
        css={iconButtonStyle(size)}
        aria-label="공유하기"
        disabled={disabled}
        onClick={onClick}
      >
        <ShareIcon size={iconSize} aria-hidden />
        {showCount && typeof count === 'number' && (
          <span css={countLabelStyle}>{formatCount(count)}</span>
        )}
      </button>
    );
  },
);

ShareButton.displayName = 'ShareButton';
export default ShareButton;
