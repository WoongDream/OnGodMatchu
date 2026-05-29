import { memo, type ReactNode } from 'react';
import { CATEGORIES } from '@/types/quiz';
import type { Category } from '@/types';
import Input from '@/components/input';
import ChipButton from '@/components/chip-button';
import ImageUpload from '@/components/image-upload';
import type { ImageEditResult } from '@/components/image-edit-modal';
import type { ImageSlot } from '@/lib/image/imageSlot';

const THUMBNAIL_ASPECT = 16 / 9;
import useCategories from '@/hooks/useCategories';
import {
  sectionStyle,
  sectionTitleStyle,
  categoryFieldStyle,
  thumbnailFieldStyle,
  fieldGroupStyle,
  fieldLabelRowStyle,
  requiredDotStyle,
  errorMessageStyle,
  textareaStyle,
} from './QuizInfoForm.style';

const FALLBACK_CATEGORIES = CATEGORIES.map((c) => ({ key: c.value, label: c.label }));

export type QuizInfoFormErrors = {
  title?: string;
  description?: string;
  category?: string;
};

type QuizInfoFormProps = {
  title: string;
  description: string;
  category: Category | null;
  thumbnailSlot: ImageSlot;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  onThumbnailApply: (result: ImageEditResult) => void;
  onThumbnailRemove: () => void;
  /** title 입력 바로 아래에 끼워넣을 슬롯. */
  belowTitleSlot?: ReactNode;
  /** 카테고리 아래에 끼워넣을 슬롯 (예: 공개 설정). */
  belowCategorySlot?: ReactNode;
  /** 외부에서 트리거된 검증 에러. 입력 시 호출자가 해당 키를 비워 자동 해제. */
  errors?: QuizInfoFormErrors;
};

const QuizInfoForm = memo(
  ({
    title,
    description,
    category,
    thumbnailSlot,
    onTitleChange,
    onDescriptionChange,
    onCategoryChange,
    onThumbnailApply,
    onThumbnailRemove,
    belowTitleSlot,
    belowCategorySlot,
    errors,
  }: QuizInfoFormProps) => {
    const { categories } = useCategories();
    const items = categories ?? FALLBACK_CATEGORIES;

    return (
      <section css={sectionStyle}>
        <h2 css={sectionTitleStyle}>퀴즈 정보</h2>
        <div css={thumbnailFieldStyle}>
          <ImageUpload
            label="썸네일 (선택)"
            slot={thumbnailSlot}
            aspect={THUMBNAIL_ASPECT}
            onApply={onThumbnailApply}
            onRemove={onThumbnailRemove}
          />
        </div>
        <Input
          label={
            errors?.title ? (
              <>
                제목 <span css={requiredDotStyle}>•</span>
              </>
            ) : (
              '제목'
            )
          }
          value={title}
          onChange={onTitleChange}
          placeholder="퀴즈 제목을 입력하세요"
          error={errors?.title}
        />
        {belowTitleSlot}
        <div css={fieldGroupStyle}>
          <label css={fieldLabelRowStyle}>
            설명{errors?.description && <span css={requiredDotStyle}>•</span>}
          </label>
          <textarea
            css={textareaStyle(!!errors?.description)}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="퀴즈에 대한 설명을 입력하세요"
          />
          {errors?.description && <span css={errorMessageStyle}>{errors.description}</span>}
        </div>
        <div css={fieldGroupStyle}>
          <label css={fieldLabelRowStyle}>
            카테고리{errors?.category && <span css={requiredDotStyle}>•</span>}
          </label>
          <div css={categoryFieldStyle(!!errors?.category)}>
            {items.map(({ key, label }) => (
              <ChipButton
                key={key}
                active={category === key}
                onClick={() => onCategoryChange(key as Category)}
              >
                {label}
              </ChipButton>
            ))}
          </div>
          {errors?.category && <span css={errorMessageStyle}>{errors.category}</span>}
        </div>
        {belowCategorySlot}
      </section>
    );
  },
);

QuizInfoForm.displayName = 'QuizInfoForm';
export default QuizInfoForm;
