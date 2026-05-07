import { memo, type SVGProps } from 'react';
import type { IconProps } from './Icon.type';

const baseProps: SVGProps<SVGSVGElement> = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const wrap = (
  displayName: string,
  paths: React.ReactNode,
): React.MemoExoticComponent<(props: IconProps) => React.ReactElement> => {
  const Component = memo(({ size = 24, className, ...rest }: IconProps) => (
    <svg
      {...baseProps}
      width={size}
      height={size}
      className={className}
      role={rest['aria-label'] ? 'img' : undefined}
      aria-hidden={rest['aria-label'] ? undefined : true}
      aria-label={rest['aria-label']}
    >
      {paths}
    </svg>
  ));
  Component.displayName = displayName;
  return Component;
};

export const QuizIcon = wrap(
  'QuizIcon',
  <>
    <path d="M10 2.5h4" />
    <path d="M12 2.5v2" />
    <path d="M17.6 4.6l1.1 1.1" />
    <circle cx="12" cy="12.5" r="7" />
    <path d="M9.75 10.6c.1-.95.96-1.7 2.06-1.7 1.18 0 2.14.86 2.14 1.92 0 .76-.5 1.42-1.21 1.74-.5.22-.84.66-.84 1.16v.28" />
    <circle cx="11.9" cy="16" r="0.5" fill="currentColor" stroke="none" />
  </>,
);

export const PlayIcon = wrap(
  'PlayIcon',
  <path d="M8.5 5.2c0-1.1 1.2-1.78 2.14-1.2l8.3 5.06a1.4 1.4 0 0 1 0 2.4l-8.3 5.06c-.94.58-2.14-.1-2.14-1.2V5.2Z" />,
);

export const StarIcon = wrap(
  'StarIcon',
  <path d="M12 1.4c.42 0 .8.24.98.62l2.1 4.45 4.78.7c.94.14 1.32 1.3.64 1.97l-3.46 3.4.82 4.83c.16.95-.83 1.67-1.66 1.22L12 16.3l-4.2 2.3c-.83.45-1.82-.27-1.66-1.22l.82-4.84-3.46-3.4c-.68-.66-.3-1.82.64-1.96l4.78-.7 2.1-4.45c.18-.38.56-.62.98-.62Z" />,
);

export const CommentIcon = wrap(
  'CommentIcon',
  <path d="M4 10c0-3.6 3.58-6.5 8-6.5s8 2.9 8 6.5-3.58 6.5-8 6.5c-.85 0-1.68-.1-2.46-.32l-3.2 2.6c-.6.49-1.46-.02-1.36-.8l.36-3.2A6.07 6.07 0 0 1 4 10Z" />,
);

export const ShareIcon = wrap(
  'ShareIcon',
  <>
    <circle cx="6" cy="11" r="2.5" />
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M8.2 9.85 15.8 6.15" />
    <path d="M8.2 12.15 15.8 15.85" />
  </>,
);

export const AccuracyIcon = wrap(
  'AccuracyIcon',
  <>
    <circle cx="12" cy="11" r="8.5" />
    <path d="M8.5 11.5 11 14l4.5-6" />
  </>,
);

export const TrendingUpIcon = wrap(
  'TrendingUpIcon',
  <>
    <polyline points="3 17 9.5 10.5 13.5 14.5 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </>,
);

export const ArrowUpIcon = wrap(
  'ArrowUpIcon',
  <>
    <path d="M12 18V5" />
    <path d="M6 11l6-6 6 6" />
  </>,
);

export const ArrowDownIcon = wrap(
  'ArrowDownIcon',
  <>
    <path d="M12 5v13" />
    <path d="M6 12l6 6 6-6" />
  </>,
);
