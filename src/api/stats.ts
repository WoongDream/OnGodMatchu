import instance from './instance';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type DailyVisitorPoint = {
  /** ISO 날짜 (YYYY-MM-DD), KST. */
  date: string;
  visitorCount: number;
};

export type VisitorSummary = {
  /** KST 오늘 고유 방문자 수. */
  today: number;
  /** 서비스 전체 누적 고유 방문자 수. */
  total: number;
  /** KST 최근 7일(오늘 포함) 일자별 카운트, 오름차순. 데이터 없는 날은 0. */
  daily: DailyVisitorPoint[];
};

export const getVisitorSummary = async (): Promise<VisitorSummary> => {
  const res = await instance.get<ApiResponse<VisitorSummary>>('/api/stats/visitors');
  return res.data.data;
};
