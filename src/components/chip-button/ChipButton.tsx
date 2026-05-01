import { memo } from 'react';
import type { ChipButtonProps } from './ChipButton.type';
import { chipStyle } from './ChipButton.style';

const ChipButton = memo(({ active = false, onClick, children }: ChipButtonProps) => {
  return (
    <button css={chipStyle(active)} onClick={onClick}>
      {children}
    </button>
  );
});

ChipButton.displayName = 'ChipButton';
export default ChipButton;
