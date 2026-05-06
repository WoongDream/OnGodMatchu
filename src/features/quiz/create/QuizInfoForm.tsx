import { memo } from 'react';
import { CATEGORIES } from '@/types/quiz';
import type { Category } from '@/types';
import Input from '@/components/input';
import ChipButton from '@/components/chip-button';
import ImageUpload from '@/components/image-upload';
import useCategories from '@/hooks/useCategories';
import { sectionStyle, sectionTitleStyle, categoryRowStyle } from './QuizInfoForm.style';

const FALLBACK_CATEGORIES = CATEGORIES.map((c) => ({ key: c.value, label: c.label }));

type QuizInfoFormProps = {
  title: string;
  description: string;
  category: Category | null;
  thumbnailPreviewUrl: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  onThumbnailChange: (file: File, url: string) => void;
  onThumbnailRemove: () => void;
};

const QuizInfoForm = memo(
  ({
    title,
    description,
    category,
    thumbnailPreviewUrl,
    onTitleChange,
    onDescriptionChange,
    onCategoryChange,
    onThumbnailChange,
    onThumbnailRemove,
  }: QuizInfoFormProps) => {
    const { categories } = useCategories();
    const items = categories ?? FALLBACK_CATEGORIES;

    return (
      <section css={sectionStyle}>
        <h2 css={sectionTitleStyle}>퀴즈 정보</h2>
        <ImageUpload
          label="썸네일 (선택)"
          previewUrl={thumbnailPreviewUrl}
          onChange={onThumbnailChange}
          onRemove={onThumbnailRemove}
        />
        <Input
          label="제목"
          value={title}
          onChange={onTitleChange}
          placeholder="퀴즈 제목을 입력하세요"
        />
        <Input
          label="설명"
          value={description}
          onChange={onDescriptionChange}
          placeholder="퀴즈에 대한 설명을 입력하세요"
        />
        <div css={categoryRowStyle}>
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
      </section>
    );
  },
);

QuizInfoForm.displayName = 'QuizInfoForm';
export default QuizInfoForm;
