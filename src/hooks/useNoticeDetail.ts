import useSWR from 'swr';
import { getAnnouncementDetail, getReleaseNoteDetail } from '@/api/notice';
import type { NoticeDetail } from '@/types';
import type { NoticeKind } from './useNoticesInfinite';

export type UseNoticeDetailReturn = {
  notice: NoticeDetail | undefined;
  isLoading: boolean;
  error: unknown;
};

const useNoticeDetail = (kind: NoticeKind, id: number | undefined): UseNoticeDetailReturn => {
  const key = id !== undefined && Number.isFinite(id) ? (['notice', kind, id] as const) : null;
  const { data, error, isLoading } = useSWR(key, ([, k, noticeId]) =>
    k === 'announcements'
      ? getAnnouncementDetail(noticeId as number)
      : getReleaseNoteDetail(noticeId as number),
  );

  return { notice: data, isLoading, error };
};

export default useNoticeDetail;
