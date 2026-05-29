export type ShareButtonVariant = 'icon' | 'chip';
export type ShareButtonSize = 'sm' | 'md' | 'lg';

export type ShareButtonProps = {
  count?: number;
  variant?: ShareButtonVariant;
  size?: ShareButtonSize;
  disabled?: boolean;
  showCount?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
