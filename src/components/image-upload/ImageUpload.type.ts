export type ImageUploadProps = {
  previewUrl: string | null;
  onChange: (file: File, previewUrl: string) => void;
  onRemove: () => void;
  label?: string;
};
