import { memo, useId, useRef, useState } from 'react';
import ImageEditModal from '@/components/image-edit-modal';
import type { ImageTransform } from '@/types';
import type { ImageUploadProps } from './ImageUpload.type';
import { validateImageFile, getValidationMessage } from './ImageUpload.policy';
import {
  wrapperStyle,
  labelStyle,
  areaStyle,
  placeholderStyle,
  placeholderTextStyle,
  previewImageStyle,
  hiddenInputStyle,
  errorTextStyle,
} from './ImageUpload.style';

type ModalState = {
  src: string;
  initialFile: File | null;
  initialTransform: ImageTransform | null;
  canDelete: boolean;
  key: number;
};

const ImageUpload = memo(
  ({ slot, aspect, onApply, onRemove, label, invalid = false }: ImageUploadProps) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const openCountRef = useRef(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);

    const hasImage = slot.previewUrl !== null;

    // 새로 선택한 파일로 편집 모달 오픈 (빈 드롭존 드래그/클릭, flow 1·2).
    const openWithFile = (file: File) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        setErrorMessage(getValidationMessage(validationError));
        return;
      }
      setErrorMessage(null);
      openCountRef.current += 1;
      setModal({
        src: URL.createObjectURL(file),
        initialFile: file,
        initialTransform: null,
        canDelete: false,
        key: openCountRef.current,
      });
    };

    // 기존 이미지 재편집 (flow 3). 원본 URL 을 모달 src 로 사용 — 교체 안 하면 originalFile=null 로 남아
    // slot.originalImageKey 가 그대로 보존된다(원본 재업로드·삭제 없음). 재크롭은 canvas(원본 CORS 필요).
    const openForEdit = () => {
      setErrorMessage(null);
      const src = slot.originalFile
        ? URL.createObjectURL(slot.originalFile)
        : (slot.originalUrl ?? slot.previewUrl);
      if (!src) {
        return;
      }
      openCountRef.current += 1;
      setModal({
        src,
        initialFile: slot.originalFile,
        initialTransform: slot.transform,
        canDelete: true,
        key: openCountRef.current,
      });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (file) {
        openWithFile(file);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        openWithFile(file);
      }
    };

    return (
      <div css={wrapperStyle}>
        {label && (
          <span css={labelStyle} id={`${id}-label`}>
            {label}
          </span>
        )}

        {hasImage ? (
          <button
            type="button"
            css={areaStyle(true, invalid)}
            onClick={openForEdit}
            aria-labelledby={label ? `${id}-label` : undefined}
            aria-label={label ? undefined : '이미지 편집'}
          >
            <img
              css={previewImageStyle}
              src={slot.previewUrl ?? undefined}
              alt="업로드 이미지 미리보기"
            />
          </button>
        ) : (
          <label
            css={areaStyle(false, invalid)}
            htmlFor={id}
            aria-labelledby={label ? `${id}-label` : undefined}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div css={placeholderStyle}>
              <span css={placeholderTextStyle}>클릭하거나 이미지를 끌어다 놓으세요</span>
              <span css={placeholderTextStyle}>JPG, PNG, WEBP · 최대 5MB</span>
            </div>
            <input
              css={hiddenInputStyle}
              ref={inputRef}
              id={id}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
            />
          </label>
        )}

        {errorMessage && (
          <span css={errorTextStyle} role="alert">
            {errorMessage}
          </span>
        )}

        {modal && (
          <ImageEditModal
            key={modal.key}
            isOpen
            src={modal.src}
            initialFile={modal.initialFile}
            initialTransform={modal.initialTransform}
            aspect={aspect}
            canDelete={modal.canDelete}
            onCancel={() => setModal(null)}
            onApply={(result) => {
              onApply(result);
              setModal(null);
            }}
            onDelete={() => {
              onRemove();
              setModal(null);
            }}
          />
        )}
      </div>
    );
  },
);

ImageUpload.displayName = 'ImageUpload';
export default ImageUpload;
