export const BIO_MAX_LENGTH = 40;

export const PROFILE_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const PROFILE_IMAGE_ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ProfileImageMimeType = (typeof PROFILE_IMAGE_ALLOWED_MIME)[number];

export const isWithinBioLength = (value: string): boolean => value.length <= BIO_MAX_LENGTH;

export const isAllowedProfileImageMime = (mime: string): boolean =>
  (PROFILE_IMAGE_ALLOWED_MIME as readonly string[]).includes(mime);

export const isWithinProfileImageSize = (bytes: number): boolean =>
  bytes <= PROFILE_IMAGE_MAX_BYTES;
