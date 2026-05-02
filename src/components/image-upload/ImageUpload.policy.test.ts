import { describe, it, expect } from 'vitest';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  validateImageFile,
  getValidationMessage,
} from './ImageUpload.policy';

const makeFile = (type: string, size: number): File => {
  const file = new File(['content'], 'sample', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('ImageUpload.policy', () => {
  describe('validateImageFile', () => {
    it('accepts allowed mime types under size limit', () => {
      ALLOWED_MIME_TYPES.forEach((mime) => {
        expect(validateImageFile(makeFile(mime, 1024))).toBeNull();
      });
    });

    it('accepts file exactly at max size', () => {
      expect(validateImageFile(makeFile('image/png', MAX_FILE_SIZE_BYTES))).toBeNull();
    });

    it('returns INVALID_TYPE for non-image mime', () => {
      expect(validateImageFile(makeFile('application/pdf', 1024))).toBe('INVALID_TYPE');
    });

    it('returns INVALID_TYPE for image/gif (not in whitelist)', () => {
      expect(validateImageFile(makeFile('image/gif', 1024))).toBe('INVALID_TYPE');
    });

    it('returns INVALID_TYPE for empty mime', () => {
      expect(validateImageFile(makeFile('', 1024))).toBe('INVALID_TYPE');
    });

    it('returns TOO_LARGE for valid mime over size limit', () => {
      expect(validateImageFile(makeFile('image/jpeg', MAX_FILE_SIZE_BYTES + 1))).toBe('TOO_LARGE');
    });

    it('checks type before size (invalid type oversize → INVALID_TYPE)', () => {
      expect(validateImageFile(makeFile('application/pdf', MAX_FILE_SIZE_BYTES + 1))).toBe(
        'INVALID_TYPE',
      );
    });
  });

  describe('getValidationMessage', () => {
    it('returns Korean message for INVALID_TYPE', () => {
      expect(getValidationMessage('INVALID_TYPE')).toMatch(/JPG.*PNG.*WEBP/);
    });

    it('returns Korean message for TOO_LARGE mentioning 5MB', () => {
      expect(getValidationMessage('TOO_LARGE')).toMatch(/5MB/);
    });
  });
});
