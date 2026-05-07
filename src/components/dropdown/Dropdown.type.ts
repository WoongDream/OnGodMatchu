export type DropdownOption<V extends string = string> = {
  value: V;
  label: string;
};

export type DropdownProps<V extends string = string> = {
  options: ReadonlyArray<DropdownOption<V>>;
  value: V;
  onChange: (value: V) => void;
  ariaLabel?: string;
  disabled?: boolean;
};
