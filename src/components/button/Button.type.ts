export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
};
