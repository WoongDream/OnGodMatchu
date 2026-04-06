import { css } from '@emotion/react';
import type { Theme } from './theme';

type FontSize = keyof Theme['fontSize'];
type FontWeight = keyof Theme['fontWeight'];

type TextOptions = {
  size?: FontSize;
  weight?: FontWeight;
  lineHeight?: number;
  ellipsis?: boolean | number;
  preWrap?: boolean;
};

const getEllipsisStyle = (ellipsis: boolean | number) => {
  if (typeof ellipsis === 'number') {
    return `
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${ellipsis};
    `;
  }
  return 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
};

export const text =
  ({ size = 'md', weight = 'regular', lineHeight, ellipsis, preWrap }: TextOptions) =>
  ({ theme }: { theme: Theme }) => css`
    font-size: ${theme.fontSize[size]};
    font-weight: ${theme.fontWeight[weight]};
    ${lineHeight && `line-height: ${lineHeight};`}
    ${ellipsis && getEllipsisStyle(ellipsis)}
      ${preWrap && 'word-break: break-word; white-space: pre-wrap;'}
  `;
