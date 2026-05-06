import { css, type Theme } from '@emotion/react';

const TRACK_WIDTH = '2.25rem';
const TRACK_HEIGHT = '1.25rem';
const THUMB_SIZE = '1rem';
const THUMB_GAP = '0.125rem';

export const trackStyle = (checked: boolean, disabled: boolean) => (theme: Theme) => css`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: ${TRACK_WIDTH};
  height: ${TRACK_HEIGHT};
  padding: 0;
  border: none;
  border-radius: ${theme.borderRadius.full};
  background-color: ${checked ? theme.colors.accent.primary : theme.colors.border.primary};
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  opacity: ${disabled ? 0.5 : 1};
  transition: background-color 0.15s;

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

export const thumbStyle = (checked: boolean) => (theme: Theme) => css`
  position: absolute;
  top: ${THUMB_GAP};
  left: ${checked ? `calc(${TRACK_WIDTH} - ${THUMB_SIZE} - ${THUMB_GAP})` : THUMB_GAP};
  width: ${THUMB_SIZE};
  height: ${THUMB_SIZE};
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.bg.primary};
  transition: left 0.15s;
`;
