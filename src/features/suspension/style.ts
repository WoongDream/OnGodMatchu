import { css } from '@emotion/react';

/** 정지 시 비활성 영역을 시각적으로 흐리게 + 상호작용 차단. */
export const disabledSurfaceStyle = css`
  opacity: 0.5;
  pointer-events: none;
  user-select: none;
`;
