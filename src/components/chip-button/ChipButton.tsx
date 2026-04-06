import { memo } from 'react';
import type { ChipButtonProps } from './ChipButton.type';
import { StyledChip } from './ChipButton.style';

const ChipButton = memo(({ active = false, onClick, children }: ChipButtonProps) => {
  return (
    <StyledChip $active={active} onClick={onClick}>
      {children}
    </StyledChip>
  );
});

ChipButton.displayName = 'ChipButton';
export default ChipButton;
