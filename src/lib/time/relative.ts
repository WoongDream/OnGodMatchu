const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

const formatAbsolute = (date: Date): string =>
  `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;

export const formatRelativeKo = (input: Date | string | number, now: Date = new Date()): string => {
  const date = input instanceof Date ? input : new Date(input);
  const time = date.getTime();
  if (Number.isNaN(time)) {
    return '';
  }

  const diff = now.getTime() - time;

  if (diff < 0) {
    return formatAbsolute(date);
  }

  if (diff < MINUTE) {
    return '방금 전';
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)}분 전`;
  }
  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)}시간 전`;
  }
  if (diff < WEEK) {
    return `${Math.floor(diff / DAY)}일 전`;
  }

  return formatAbsolute(date);
};
