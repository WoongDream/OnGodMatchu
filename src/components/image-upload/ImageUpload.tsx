import { memo, useId, useRef } from 'react';
import type { ImageUploadProps } from './ImageUpload.type';
import {
  UploadWrapper,
  UploadLabel,
  UploadArea,
  UploadPlaceholder,
  UploadPlaceholderText,
  PreviewImage,
  RemoveButton,
  HiddenInput,
} from './ImageUpload.style';

const ImageUpload = memo(({ previewUrl, onChange, onRemove, label }: ImageUploadProps) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    onChange(file, url);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  return (
    <UploadWrapper>
      {label && <UploadLabel id={`${id}-label`}>{label}</UploadLabel>}
      <UploadArea
        htmlFor={id}
        $hasPreview={!!previewUrl}
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        {previewUrl ? (
          <>
            <PreviewImage src={previewUrl} alt="업로드 이미지 미리보기" />
            <RemoveButton onClick={handleRemove}>✕</RemoveButton>
          </>
        ) : (
          <UploadPlaceholder>
            <UploadPlaceholderText>클릭하여 이미지 업로드</UploadPlaceholderText>
            <UploadPlaceholderText>JPG, PNG, WEBP</UploadPlaceholderText>
          </UploadPlaceholder>
        )}
        <HiddenInput ref={inputRef} id={id} type="file" accept="image/*" onChange={handleChange} />
      </UploadArea>
    </UploadWrapper>
  );
});

ImageUpload.displayName = 'ImageUpload';
export default ImageUpload;
