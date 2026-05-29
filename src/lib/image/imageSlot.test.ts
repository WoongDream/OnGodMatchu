import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  EMPTY_SLOT,
  slotFromServer,
  applyEditResult,
  slotHasImage,
  resolveSlot,
  type ImageSlot,
} from './imageSlot';
import type { ImageEditResult } from '@/components/image-edit-modal';
import type { ImageTransform } from '@/types';

const transform: ImageTransform = {
  v: 1,
  flipH: false,
  rotate: 90,
  crop: { x: 0.1, y: 0.2, width: 0.5, height: 0.6 },
};

const makeFile = (name: string): File => new File(['data'], name, { type: 'image/webp' });
const makeBlob = (): Blob => new Blob(['cropped'], { type: 'image/webp' });

beforeEach(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
});

describe('EMPTY_SLOT', () => {
  it('모든 필드가 null', () => {
    expect(EMPTY_SLOT).toEqual({
      previewUrl: null,
      croppedFile: null,
      originalFile: null,
      transform: null,
      imageKey: null,
      originalImageKey: null,
      originalUrl: null,
    });
  });
});

describe('slotFromServer', () => {
  it('서버 응답을 슬롯으로 hydrate — previewUrl=imageUrl, imageKey 세팅, originalImageKey 항상 null', () => {
    const slot = slotFromServer({
      imageKey: 'srv-key',
      imageUrl: 'https://cdn/img.webp',
      originalImageUrl: 'https://cdn/orig.webp',
      transform,
    });
    expect(slot).toEqual({
      previewUrl: 'https://cdn/img.webp',
      croppedFile: null,
      originalFile: null,
      transform,
      imageKey: 'srv-key',
      originalImageKey: null,
      originalUrl: 'https://cdn/orig.webp',
    });
  });

  it('originalImageUrl 미제공 시 originalUrl=imageUrl 폴백', () => {
    const slot = slotFromServer({ imageKey: 'k', imageUrl: 'https://cdn/img.webp' });
    expect(slot.originalUrl).toBe('https://cdn/img.webp');
  });

  it('파라미터 전부 없으면 EMPTY_SLOT 과 동등 (null 폴백)', () => {
    expect(slotFromServer({})).toEqual(EMPTY_SLOT);
  });
});

describe('applyEditResult', () => {
  it('1) 새 원본 + 크롭: croppedFile/originalFile 반영, previewUrl=cropped.previewUrl, 서버 key 무효화', () => {
    const prev: ImageSlot = {
      ...EMPTY_SLOT,
      imageKey: 'old-img',
      originalImageKey: 'old-orig',
      originalUrl: 'https://cdn/old.webp',
    };
    const original = makeFile('new-original.png');
    const result: ImageEditResult = {
      transform,
      cropped: { blob: makeBlob(), previewUrl: 'blob:cropped' },
      originalFile: original,
    };
    const slot = applyEditResult(prev, result);

    expect(slot.croppedFile).toBeInstanceOf(File);
    expect(slot.originalFile).toBe(original);
    expect(slot.previewUrl).toBe('blob:cropped');
    expect(slot.imageKey).toBeNull();
    expect(slot.originalImageKey).toBeNull();
    expect(slot.originalUrl).toBeNull();
    expect(slot.transform).toBe(transform);
  });

  it('2) 새 원본 + 항등(crop=null, transform=null): croppedFile=null, previewUrl=createObjectURL', () => {
    const prev: ImageSlot = { ...EMPTY_SLOT, imageKey: 'old', originalImageKey: 'old-o' };
    const original = makeFile('plain.png');
    const result: ImageEditResult = { transform: null, cropped: null, originalFile: original };
    const slot = applyEditResult(prev, result);

    expect(slot.croppedFile).toBeNull();
    expect(slot.previewUrl).toBe('blob:mock');
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(original);
    expect(slot.imageKey).toBeNull();
    expect(slot.originalImageKey).toBeNull();
    expect(slot.originalFile).toBe(original);
    expect(slot.transform).toBeNull();
  });

  it('3) 기존 서버 재편집 + 크롭: prev 원본 메타 유지, 새 크롭으로 imageKey 무효', () => {
    const prevOriginal = makeFile('prev-original.png');
    const prev: ImageSlot = {
      ...EMPTY_SLOT,
      originalFile: prevOriginal,
      imageKey: 'srv-img',
      originalImageKey: 'srv-orig',
      originalUrl: 'https://cdn/orig.webp',
      previewUrl: 'https://cdn/old-preview.webp',
    };
    const result: ImageEditResult = {
      transform,
      cropped: { blob: makeBlob(), previewUrl: 'blob:recrop' },
      originalFile: null,
    };
    const slot = applyEditResult(prev, result);

    expect(slot.originalFile).toBe(prevOriginal);
    expect(slot.croppedFile).toBeInstanceOf(File);
    expect(slot.previewUrl).toBe('blob:recrop');
    expect(slot.imageKey).toBeNull();
    expect(slot.originalImageKey).toBe('srv-orig');
    expect(slot.originalUrl).toBe('https://cdn/orig.webp');
    expect(slot.transform).toBe(transform);
  });

  it('4) 기존 서버 재편집 무변경(crop=null, originalFile=null, transform=null): prev 값 유지', () => {
    const prev: ImageSlot = {
      ...EMPTY_SLOT,
      imageKey: 'srv-img',
      originalImageKey: 'srv-orig',
      originalUrl: 'https://cdn/orig.webp',
      previewUrl: 'https://cdn/preview.webp',
    };
    const result: ImageEditResult = { transform: null, cropped: null, originalFile: null };
    const slot = applyEditResult(prev, result);

    expect(slot.previewUrl).toBe('https://cdn/preview.webp');
    expect(slot.imageKey).toBe('srv-img');
    expect(slot.originalImageKey).toBe('srv-orig');
    expect(slot.originalUrl).toBe('https://cdn/orig.webp');
    expect(slot.croppedFile).toBeNull();
    expect(slot.transform).toBeNull();
    expect(globalThis.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('cropped.blob 이 이미 File 이면 그대로 사용 (재래핑 X)', () => {
    const existingFile = makeFile('already.webp');
    const result: ImageEditResult = {
      transform,
      cropped: { blob: existingFile, previewUrl: 'blob:x' },
      originalFile: null,
    };
    const slot = applyEditResult(EMPTY_SLOT, result);
    expect(slot.croppedFile).toBe(existingFile);
  });
});

describe('slotHasImage', () => {
  it('EMPTY_SLOT 은 false', () => {
    expect(slotHasImage(EMPTY_SLOT)).toBe(false);
  });

  it('croppedFile 있으면 true', () => {
    expect(slotHasImage({ ...EMPTY_SLOT, croppedFile: makeFile('c.webp') })).toBe(true);
  });

  it('originalFile 있으면 true', () => {
    expect(slotHasImage({ ...EMPTY_SLOT, originalFile: makeFile('o.webp') })).toBe(true);
  });

  it('imageKey 있으면 true', () => {
    expect(slotHasImage({ ...EMPTY_SLOT, imageKey: 'k' })).toBe(true);
  });

  it('previewUrl 있으면 true', () => {
    expect(slotHasImage({ ...EMPTY_SLOT, previewUrl: 'https://cdn/x.webp' })).toBe(true);
  });
});

describe('resolveSlot', () => {
  it('1) 새 원본+크롭 둘 다: upload 2회, 크롭키/원본키 분리', async () => {
    const upload = vi
      .fn<(file: File) => Promise<string>>()
      .mockResolvedValueOnce('k-orig')
      .mockResolvedValueOnce('k-crop');
    const slot: ImageSlot = {
      ...EMPTY_SLOT,
      originalFile: makeFile('orig.png'),
      croppedFile: makeFile('crop.webp'),
      transform,
    };
    const resolved = await resolveSlot(slot, upload);

    expect(upload).toHaveBeenCalledTimes(2);
    expect(resolved).toEqual({
      imageKey: 'k-crop',
      originalImageKey: 'k-orig',
      transform,
    });
  });

  it('2) 원본만(크롭 없음, transform=null): upload 1회, imageKey===originalImageKey', async () => {
    const upload = vi.fn<(file: File) => Promise<string>>().mockResolvedValue('k-orig');
    const slot: ImageSlot = { ...EMPTY_SLOT, originalFile: makeFile('orig.png'), transform: null };
    const resolved = await resolveSlot(slot, upload);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(resolved.imageKey).toBe('k-orig');
    expect(resolved.originalImageKey).toBe('k-orig');
    expect(resolved.imageKey).toBe(resolved.originalImageKey);
    expect(resolved.transform).toBeUndefined();
  });

  it('3) 변경 없는 기존 크롭(파일 없음, transform 존재, key 존재): upload 0회, 기존 key 재사용', async () => {
    const upload = vi.fn<(file: File) => Promise<string>>();
    const slot: ImageSlot = {
      ...EMPTY_SLOT,
      imageKey: 'srv-img',
      originalImageKey: 'srv-orig',
      transform,
    };
    const resolved = await resolveSlot(slot, upload);

    expect(upload).toHaveBeenCalledTimes(0);
    expect(resolved.imageKey).toBe('srv-img');
    expect(resolved.originalImageKey).toBe('srv-orig');
    expect(resolved.transform).toBe(transform);
  });

  it('4) 빈 슬롯: upload 0회, imageKey/originalImageKey undefined', async () => {
    const upload = vi.fn<(file: File) => Promise<string>>();
    const resolved = await resolveSlot(EMPTY_SLOT, upload);

    expect(upload).toHaveBeenCalledTimes(0);
    expect(resolved.imageKey).toBeUndefined();
    expect(resolved.originalImageKey).toBeUndefined();
    expect(resolved.transform).toBeUndefined();
  });
});
