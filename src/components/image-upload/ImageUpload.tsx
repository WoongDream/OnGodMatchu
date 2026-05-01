import { memo, useId, useRef } from 'react';
import type { ImageUploadProps } from './ImageUpload.type';
import {
  wrapperStyle,
  labelStyle,
  areaStyle,
  placeholderStyle,
  placeholderTextStyle,
  previewImageStyle,
  removeButtonStyle,
  hiddenInputStyle,
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
            <span css={placeholderTextStyle}>JPG, PNG, WEBP</span>
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
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';
export default ImageUpload;
