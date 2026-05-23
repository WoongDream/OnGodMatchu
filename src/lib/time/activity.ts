const DAY_MS = 24 * 60 * 60 * 1000;

const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

const formatDateKo = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const startOfDayUtc = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

export type ActivityDays = {
  days: number;
  joinedDate: string;
};

export const getActivityDays = (
  createdAt: string | Date | number,
  now: Date = new Date(),
): ActivityDays | null => {
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const time = created.getTime();
  if (Number.isNaN(time)) {
    return null;
  }

  const diffMs = startOfDayUtc(now) - startOfDayUtc(created);
  const elapsed = Math.max(0, Math.floor(diffMs / DAY_MS));
  const days = elapsed + 1;
  return { days, joinedDate: formatDateKo(created) };
};
