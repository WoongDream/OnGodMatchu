import useSWR from 'swr';
import { getAnnouncementDetail } from '@/api/notice';
import type { NoticeDetail } from '@/types';

export type UseNoticeDetailReturn = {
  notice: NoticeDetail | undefined;
  isLoading: boolean;
  error: unknown;
};

const useNoticeDetail = (id: number | undefined): UseNoticeDetailReturn => {
  const key = id != null ? (['notice', 'announcements', id] as const) : null;
  const { data, error, isLoading } = useSWR(key, ([, , noticeId]) =>
    getAnnouncementDetail(noticeId as number),
  );

  return { notice: data, isLoading, error };
};

export default useNoticeDetail;
