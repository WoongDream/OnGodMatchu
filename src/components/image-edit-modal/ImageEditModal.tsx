import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Button from '@/components/button';
import Modal from '@/components/modal';
import { bakeCroppedImage, renderOrientedDataUrl } from '@/lib/image/bakeImage';
import {
  IDENTITY_ORIENTATION,
  buildTransform,
  flipOrientation,
  isIdentityTransform,
  normalizedToPercentCrop,
  percentToNormalizedCrop,
  rotateOrientationCw,
  rotatedDimensions,
  type Orientation,
} from '@/lib/image/transform';
import type { ImageEditModalProps } from './ImageEditModal.type';
import {
  confirmMessageStyle,
  cropAreaStyle,
  deleteButtonStyle,
  dimensionBadgeStyle,
  fileLabelStyle,
  footerActionsStyle,
  footerRightStyle,
  hiddenInputStyle,
  loadingStyle,
  replaceButtonStyle,
  subtitleStyle,
  toolButtonStyle,
  toolbarStyle,
} from './ImageEditModal.style';

const centeredAspectCrop = (dispW: number, dispH: number, aspect: number): PercentCrop =>
  centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, dispW, dispH),
    dispW,
    dispH,
  ) as PercentCrop;

const ImageEditModal = memo(
  ({
    isOpen,
    src,
    initialFile,
    aspect,
    fileName,
    initialTransform,
    canDelete = false,
    onCancel,
    onApply,
    onDelete,
  }: ImageEditModalProps) => {
    // 작업 중 소스 — 초기엔 props, 「이미지 교체」 로 바뀐다. (슬롯/오픈마다 부모가 key 로 remount)
    const [activeSrc, setActiveSrc] = useState<string | null>(src);
    const [activeFile, setActiveFile] = useState<File | null>(initialFile ?? null);
    const [orientation, setOrientation] = useState<Orientation>(
      initialTransform
        ? { flipH: initialTransform.flipH, rotate: initialTransform.rotate }
        : IDENTITY_ORIENTATION,
    );
    const [crop, setCrop] = useState<PercentCrop | undefined>(undefined);
    const [completedCrop, setCompletedCrop] = useState<PercentCrop | undefined>(undefined);
    const [loaded, setLoaded] = useState<{ src: string; img: HTMLImageElement } | null>(null);
    const [isBaking, setIsBaking] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // 다음 로드에서 crop 을 어떤 transform 으로 seed 할지 (초기=initialTransform, 교체=null→센터). 동기 setState 없이 ref.
    const seedTransformRef = useRef(initialTransform ?? null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    // activeSrc 로드 → onload(async)에서 loaded/crop 세팅 (effect 본문 동기 setState 없음).
    useEffect(() => {
      if (!isOpen || !activeSrc) {
        return;
      }
      let cancelled = false;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (cancelled) {
          return;
        }
        const seed = seedTransformRef.current;
        const rotate = seed ? seed.rotate : orientation.rotate;
        const disp = rotatedDimensions(img.naturalWidth, img.naturalHeight, rotate);
        const initialCrop = seed
          ? normalizedToPercentCrop(seed.crop)
          : centeredAspectCrop(disp.width, disp.height, aspect);
        setLoaded({ src: activeSrc, img });
        setCrop(initialCrop);
        setCompletedCrop(initialCrop);
      };
      img.src = activeSrc;
      return () => {
        cancelled = true;
      };
    }, [isOpen, activeSrc, aspect, orientation.rotate]);

    const baseImg = isOpen && loaded && loaded.src === activeSrc ? loaded.img : null;

    const orientedSrc = useMemo(() => {
      if (!baseImg) {
        return null;
      }
      return renderOrientedDataUrl(
        baseImg,
        baseImg.naturalWidth,
        baseImg.naturalHeight,
        orientation.flipH,
        orientation.rotate,
      );
    }, [baseImg, orientation.flipH, orientation.rotate]);

    const handleRotate = useCallback(() => {
      if (!baseImg) {
        return;
      }
      const next = rotateOrientationCw(orientation);
      const disp = rotatedDimensions(baseImg.naturalWidth, baseImg.naturalHeight, next.rotate);
      const c = centeredAspectCrop(disp.width, disp.height, aspect);
      setOrientation(next);
      setCrop(c);
      setCompletedCrop(c);
    }, [baseImg, orientation, aspect]);

    const handleFlip = useCallback(() => {
      const next = flipOrientation(orientation);
      const c = crop ? { ...crop, x: 100 - crop.x - crop.width } : undefined;
      setOrientation(next);
      setCrop(c);
      setCompletedCrop(c);
    }, [orientation, crop]);

    const handleReset = useCallback(() => {
      if (!baseImg) {
        return;
      }
      const disp = rotatedDimensions(baseImg.naturalWidth, baseImg.naturalHeight, 0);
      const c = centeredAspectCrop(disp.width, disp.height, aspect);
      setOrientation(IDENTITY_ORIENTATION);
      setCrop(c);
      setCompletedCrop(c);
    }, [baseImg, aspect]);

    // 「이미지 교체」 — 파일 탐색기 → 새 원본으로 교체, orientation/crop 리셋.
    const handleReplaceClick = useCallback(() => {
      replaceInputRef.current?.click();
    }, []);

    const handleReplaceFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !file.type.startsWith('image/')) {
        return;
      }
      seedTransformRef.current = null;
      setOrientation(IDENTITY_ORIENTATION);
      setCrop(undefined);
      setCompletedCrop(undefined);
      setActiveFile(file);
      setActiveSrc(URL.createObjectURL(file));
    }, []);

    const handleApply = useCallback(async () => {
      const activeCrop = completedCrop ?? crop;
      if (!baseImg || !activeCrop) {
        return;
      }
      const transform = buildTransform(orientation, percentToNormalizedCrop(activeCrop));
      if (isIdentityTransform(transform)) {
        onApply({ transform: null, cropped: null, originalFile: activeFile });
        return;
      }
      setIsBaking(true);
      try {
        const cropped = await bakeCroppedImage(
          baseImg,
          baseImg.naturalWidth,
          baseImg.naturalHeight,
          transform,
        );
        onApply({ transform, cropped, originalFile: activeFile });
      } finally {
        setIsBaking(false);
      }
    }, [baseImg, orientation, crop, completedCrop, activeFile, onApply]);

    const handleDeleteConfirm = useCallback(() => {
      setConfirmDelete(false);
      onDelete?.();
    }, [onDelete]);

    const dimensionLabel = useMemo(() => {
      const c = completedCrop ?? crop;
      if (!baseImg || !c) {
        return null;
      }
      const disp = rotatedDimensions(
        baseImg.naturalWidth,
        baseImg.naturalHeight,
        orientation.rotate,
      );
      const w = Math.round((c.width / 100) * disp.width);
      const h = Math.round((c.height / 100) * disp.height);
      return `${w} × ${h}`;
    }, [baseImg, crop, completedCrop, orientation.rotate]);

    const originalLabel = useMemo(() => {
      const name = activeFile?.name ?? fileName;
      if (!baseImg) {
        return name ?? null;
      }
      const dims = `${baseImg.naturalWidth} × ${baseImg.naturalHeight}`;
      return name ? `${name} · ${dims}` : dims;
    }, [baseImg, activeFile, fileName]);

    return (
      <>
        <Modal
          isOpen={isOpen}
          onClose={onCancel}
          title="이미지 편집"
          size="md"
          closeOnOverlay={false}
          footer={
            <div css={footerActionsStyle}>
              {canDelete && (
                <button
                  type="button"
                  css={deleteButtonStyle}
                  onClick={() => setConfirmDelete(true)}
                >
                  <TrashIcon />
                  이미지 삭제
                </button>
              )}
              <div css={footerRightStyle}>
                <Button variant="secondary" onClick={onCancel}>
                  취소
                </Button>
                <Button onClick={handleApply} disabled={!baseImg || isBaking}>
                  {isBaking ? '처리 중...' : '이미지 적용'}
                </Button>
              </div>
            </div>
          }
        >
          <p css={subtitleStyle}>사용할 영역을 드래그해서 선택하세요</p>

          <div css={cropAreaStyle}>
            {orientedSrc ? (
              <>
                <ReactCrop
                  crop={crop}
                  aspect={aspect}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(_, percentCrop) => setCompletedCrop(percentCrop)}
                >
                  <img src={orientedSrc} alt="편집할 이미지" />
                </ReactCrop>
                {dimensionLabel && <span css={dimensionBadgeStyle}>{dimensionLabel}</span>}
              </>
            ) : (
              <p css={loadingStyle}>이미지를 불러오는 중...</p>
            )}
          </div>

          {originalLabel && <span css={fileLabelStyle}>{originalLabel}</span>}

          <div css={toolbarStyle}>
            <button type="button" css={replaceButtonStyle} onClick={handleReplaceClick}>
              <UploadIcon />
              이미지 교체
            </button>
            <button type="button" css={toolButtonStyle} onClick={handleRotate} disabled={!baseImg}>
              <RotateIcon />
              90° 회전
            </button>
            <button type="button" css={toolButtonStyle} onClick={handleFlip} disabled={!baseImg}>
              <FlipIcon />
              좌우 반전
            </button>
            <button type="button" css={toolButtonStyle} onClick={handleReset} disabled={!baseImg}>
              <ResetIcon />
              초기화
            </button>
          </div>

          <input
            ref={replaceInputRef}
            css={hiddenInputStyle}
            type="file"
            accept="image/*"
            onChange={handleReplaceFile}
          />
        </Modal>

        <Modal
          isOpen={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          title="이미지 삭제"
          size="sm"
          footer={
            <div css={footerRightStyle}>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                취소
              </Button>
              <Button onClick={handleDeleteConfirm}>삭제</Button>
            </div>
          }
        >
          <p css={confirmMessageStyle}>이미지를 삭제하시겠습니까?</p>
        </Modal>
      </>
    );
  },
);

const UploadIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 10V3M5 6l3-3 3 3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 11v1.5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V11"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const RotateIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M13 5a5.5 5.5 0 1 0 1 3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M13.5 2v3h-3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FlipIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 2v12"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeDasharray="2 2"
    />
    <path d="M6 5 3 8l3 3V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M10 5l3 3-3 3V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const ResetIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 5a5.5 5.5 0 1 1-1 3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M2.5 2v3h3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 4.5h10M6.5 4V3h3v1M5 4.5l.5 8h5l.5-8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

ImageEditModal.displayName = 'ImageEditModal';
export default ImageEditModal;
