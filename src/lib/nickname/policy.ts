export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;
export const NICKNAME_ALLOWED_REGEX = /^[가-힣A-Za-z0-9_]+$/;

export const normalizeNickname = (value: string): string => value.trim().normalize('NFC');

export const isWithinNicknameLength = (value: string): boolean =>
  value.length >= NICKNAME_MIN_LENGTH && value.length <= NICKNAME_MAX_LENGTH;

export const matchesNicknamePolicy = (value: string): boolean =>
  isWithinNicknameLength(value) && NICKNAME_ALLOWED_REGEX.test(value);
