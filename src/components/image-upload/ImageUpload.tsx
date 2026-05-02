import { memo, useId, useRef, useState } from 'react';
import type { ImageUploadProps } from './ImageUpload.type';
import { validateImageFile, getValidationMessage } from './ImageUpload.policy';
import {
  wrapperStyle,
  labelStyle,
  areaStyle,
  placeholderStyle,
  placeholderTextStyle,
  previewImageStyle,
  removeButtonStyle,
  hiddenInputStyle,
  errorTextStyle,
} from './ImageUpload.style';

const ImageUpload = memo(({ previewUrl, onChange, onRemove, label }: ImageUploadProps) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const validationError = validateImageFile(file);
    if (validationError) {
      setErrorMessage(getValidationMessage(validationError));
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }
    setErrorMessage(null);
    const url = URL.createObjectURL(file);
    onChange(file, url);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);
    onRemove();
  };

  return (
    <div css={wrapperStyle}>
      {label && (
        <span css={labelStyle} id={`${id}-label`}>
          {label}
        </span>
      )}
      <label
        css={areaStyle(!!previewUrl)}
        htmlFor={id}
        aria-labelledby={label ? `${id}-label` : undefined}
      >
        {previewUrl ? (
          <>
            <img css={previewImageStyle} src={previewUrl} alt="업로드 이미지 미리보기" />
            <button css={removeButtonStyle} onClick={handleRemove}>
              ✕
            </button>
          </>
        ) : (
          <div css={placeholderStyle}>
            <span css={placeholderTextStyle}>클릭하여 이미지 업로드</span>
            <span css={placeholderTextStyle}>JPG, PNG, WEBP · 최대 5MB</span>
          </div>
        )}
        <input
          css={hiddenInputStyle}
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      </label>
      {errorMessage && (
        <span css={errorTextStyle} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';
export default ImageUpload;
