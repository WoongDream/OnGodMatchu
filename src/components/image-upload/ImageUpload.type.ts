export type ImageUploadProps = {
  previewUrl: string | null;
  onChange: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  label?: string;
  /** 외부 검증에서 invalid 인 경우 영역에 빨간 border 표시. */
  invalid?: boolean;
};
