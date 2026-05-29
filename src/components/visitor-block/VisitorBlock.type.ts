export type VisitorBlockProps = {
  today: number;
  total: number;
  /** 최근 7일(또는 그 이하) 일자별 카운트, 오름차순. 모바일에서는 미사용. */
  daily: ReadonlyArray<number>;
};
