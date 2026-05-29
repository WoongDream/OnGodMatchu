import useSWR from 'swr';
import { getAnnouncementDetail } from '@/api/notice';
import type { NoticeDetail } from '@/types';

export type UseNoticeDetailReturn = {
  notice: NoticeDetail | undefined;
  isLoading: boolean;
  error: unknown;
};

const useNoticeDetail = (slug: string | undefined): UseNoticeDetailReturn => {
  const key = slug ? (['notice', 'announcements', slug] as const) : null;
  const { data, error, isLoading } = useSWR(key, ([, , noticeSlug]) =>
    getAnnouncementDetail(noticeSlug as string),
  );

  return { notice: data, isLoading, error };
};

export default useNoticeDetail;
