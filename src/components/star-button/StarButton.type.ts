export type StarButtonVariant = 'icon' | 'chip';
export type StarButtonSize = 'sm' | 'md' | 'lg';

export type StarButtonProps = {
  active: boolean;
  count?: number;
  variant?: StarButtonVariant;
  size?: StarButtonSize;
  disabled?: boolean;
  showCount?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
