import { memo } from 'react';
import type { ToggleProps } from './Toggle.type';
import { trackStyle, thumbStyle } from './Toggle.style';

const Toggle = memo(({ checked, onChange, disabled = false, ariaLabel }: ToggleProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      css={trackStyle(checked, disabled)}
    >
      <span css={thumbStyle(checked)} aria-hidden="true" />
    </button>
  );
});

Toggle.displayName = 'Toggle';
export default Toggle;
