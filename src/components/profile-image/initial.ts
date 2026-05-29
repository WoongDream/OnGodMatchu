export const INITIAL_PALETTE = [
  '#f472b6',
  '#a78bfa',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#22d3ee',
] as const;

export const FALLBACK_INITIAL = '?';
export const FALLBACK_COLOR = '#a1a1aa';

const normalize = (value: string | null | undefined): string =>
  typeof value === 'string' ? value.trim().normalize('NFC') : '';

export const getInitial = (nickname: string): string => {
  const normalized = normalize(nickname);
  if (normalized.length === 0) {
    return FALLBACK_INITIAL;
  }
  return [...normalized][0]?.toUpperCase() ?? FALLBACK_INITIAL;
};

export const getInitialColor = (nickname: string): string => {
  const normalized = normalize(nickname);
  if (normalized.length === 0) {
    return FALLBACK_COLOR;
  }
  let sum = 0;
  for (let i = 0; i < normalized.length; i++) {
    sum = (sum + normalized.charCodeAt(i)) >>> 0;
  }
  return INITIAL_PALETTE[sum % INITIAL_PALETTE.length];
};
